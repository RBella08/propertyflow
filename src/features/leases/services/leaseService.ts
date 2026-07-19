import { supabase } from '@/lib/supabase';
import { getLandlordId } from '@/features/properties/services/propertyManagementService';
import type { LeaseFormInput } from '../schemas';

export interface LandlordLeaseItem {
  id: string;
  leaseNumber: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: string;
}

export interface UnitOption {
  id: string;
  propertyName: string;
  unitNumber: string;
  rentAmount: number;
}

export interface TenantLookupResult {
  tenantId: string;
  fullName: string;
  email: string;
}

export async function getAvailableUnitOptions(profileId: string): Promise<UnitOption[]> {
  const landlordId = await getLandlordId(profileId);
  const { data, error } = await supabase
    .from('units')
    .select('id, unit_number, rent_amount, properties!inner(property_name, landlord_id)')
    .eq('properties.landlord_id', landlordId)
    .eq('status', 'available')
    .order('unit_number');

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    propertyName: row.properties.property_name,
    unitNumber: row.unit_number,
    rentAmount: row.rent_amount,
  }));
}

export async function findTenantByEmail(email: string): Promise<TenantLookupResult> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) throw new Error('No account found with that email.');
  if (profile.role !== 'tenant') throw new Error('That account is not registered as a tenant.');

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle();

  if (tenantError) throw tenantError;
  if (!tenant) {
    throw new Error(
      'This tenant account has no tenant profile record. This should not normally happen — please contact support.'
    );
  }

  return {
    tenantId: tenant.id,
    fullName: profile.full_name ?? profile.email,
    email: profile.email,
  };
}

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${year}-${random}`;
}

function generateLeaseNumber() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LSE-${year}-${random}`;
}

function getBillingPeriodLabel(startDate: string, billingCycle: string) {
  const date = new Date(startDate);
  return `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()} (${billingCycle})`;
}

export async function createLease(input: LeaseFormInput): Promise<void> {
  // Guard against a race condition — confirm the unit is still available
  // right before committing, in case another tab leased it moments ago.
  const { data: unit, error: unitError } = await supabase
    .from('units')
    .select('status')
    .eq('id', input.unitId)
    .single();
  if (unitError) throw unitError;
  if (unit.status !== 'available') {
    throw new Error('This unit is no longer available. Please choose another.');
  }

  // One active lease per tenant, per FEATURES.md's stated business rule.
  const { data: existingActiveLease, error: activeLeaseError } = await supabase
    .from('leases')
    .select('id')
    .eq('tenant_id', input.tenantId)
    .eq('status', 'active')
    .maybeSingle();
  if (activeLeaseError) throw activeLeaseError;
  if (existingActiveLease) {
    throw new Error(
      'This tenant already has an active lease. Terminate it first before creating a new one.'
    );
  }

  const { data: lease, error: leaseError } = await supabase
    .from('leases')
    .insert({
      tenant_id: input.tenantId,
      unit_id: input.unitId,
      lease_number: generateLeaseNumber(),
      start_date: input.startDate,
      end_date: input.endDate,
      monthly_rent: input.monthlyRent,
      security_deposit: input.securityDeposit,
      billing_cycle: input.billingCycle,
      status: 'active',
    })
    .select('id')
    .single();

  if (leaseError) throw leaseError;

  // Not a single atomic transaction (see Step 13 objective note) — each
  // failure below is reported precisely rather than silently swallowed.
  const { error: unitUpdateError } = await supabase
    .from('units')
    .update({ status: 'occupied' })
    .eq('id', input.unitId);
  if (unitUpdateError) {
    throw new Error(
      `Lease created, but the unit status failed to update. Please set Unit "${input.unitId}" to Occupied manually.`
    );
  }

  const { error: invoiceError } = await supabase.from('invoices').insert({
    invoice_number: generateInvoiceNumber(),
    lease_id: lease.id,
    amount: input.monthlyRent,
    balance: input.monthlyRent,
    due_date: input.startDate,
    billing_period: getBillingPeriodLabel(input.startDate, input.billingCycle),
    status: 'pending',
  });

  if (invoiceError) {
    throw new Error(
      'Lease created and unit marked occupied, but the first invoice failed to generate. Please create it manually.'
    );
  }
}

export async function getLandlordLeases(profileId: string): Promise<LandlordLeaseItem[]> {
  const landlordId = await getLandlordId(profileId);

  const { data, error } = await supabase
    .from('leases')
    .select(
      `id, lease_number, start_date, end_date, monthly_rent, status,
       units!inner(unit_number, properties!inner(property_name, landlord_id)),
       tenants!inner(profiles!inner(full_name, email))`
    )
    .eq('units.properties.landlord_id', landlordId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    leaseNumber: row.lease_number,
    tenantName: row.tenants.profiles.full_name ?? row.tenants.profiles.email,
    propertyName: row.units.properties.property_name,
    unitNumber: row.units.unit_number,
    startDate: row.start_date,
    endDate: row.end_date,
    monthlyRent: row.monthly_rent,
    status: row.status,
  }));
}

export async function renewLease(leaseId: string, newEndDate: string): Promise<void> {
  const { error } = await supabase
    .from('leases')
    .update({ end_date: newEndDate, status: 'renewed' })
    .eq('id', leaseId);
  if (error) throw error;
}

export async function terminateLease(leaseId: string): Promise<void> {
  const { data: lease, error: leaseError } = await supabase
    .from('leases')
    .select('unit_id, tenant_id')
    .eq('id', leaseId)
    .single();
  if (leaseError) throw leaseError;

  const { error: updateError } = await supabase
    .from('leases')
    .update({ status: 'terminated' })
    .eq('id', leaseId);
  if (updateError) throw updateError;

  const { error: unitError } = await supabase
    .from('units')
    .update({ status: 'available' })
    .eq('id', lease.unit_id);
  if (unitError) {
    throw new Error(
      'Lease terminated, but the unit status failed to update. Please update it manually.'
    );
  }

  // Notify the tenant — best-effort, doesn't block termination itself
  // if the notification insert fails for any reason.
  try {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('profile_id')
      .eq('id', lease.tenant_id)
      .single();

    if (tenant) {
      await supabase.from('notifications').insert({
        user_id: tenant.profile_id,
        title: 'Lease terminated',
        message:
          'Your lease has been terminated by your landlord. Contact them if you have questions.',
        type: 'lease_expiry',
      });
    }
  } catch (notifyError) {
    console.error('Failed to notify tenant of lease termination:', notifyError);
  }
}
