import { supabase } from '@/lib/supabase';
import { getLandlordId } from '@/features/properties/services/propertyManagementService';

export interface LandlordTenantItem {
  tenantId: string;
  tenantProfileId: string;
  leaseId: string;
  fullName: string;
  email: string;
  phone: string | null;
  propertyName: string;
  unitNumber: string;
  leaseStatus: string;
}

export async function getManagerTenants(profileId: string): Promise<LandlordTenantItem[]> {
  const { data: properties } = await supabase
    .from('properties')
    .select('id, property_name')
    .eq('manager_id', profileId);
  const propertyIds = (properties ?? []).map((p) => p.id);
  const propertyNameMap = new Map((properties ?? []).map((p) => [p.id, p.property_name]));
  if (propertyIds.length === 0) return [];

  const { data: units } = await supabase
    .from('units')
    .select('id, unit_number, property_id')
    .in('property_id', propertyIds);
  const unitIds = (units ?? []).map((u) => u.id);
  const unitMap = new Map((units ?? []).map((u) => [u.id, u]));
  if (unitIds.length === 0) return [];

  const { data: leases, error } = await supabase
    .from('leases')
    .select('id, tenant_id, unit_id, status')
    .in('unit_id', unitIds)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const tenantIds = Array.from(new Set((leases ?? []).map((l) => l.tenant_id)));
  if (tenantIds.length === 0) return [];

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, profiles!inner(id, full_name, email, phone)')
    .in('id', tenantIds);
  const tenantMap = new Map((tenants ?? []).map((t: any) => [t.id, t.profiles]));

  const seen = new Set<string>();
  const results: LandlordTenantItem[] = [];

  for (const lease of leases ?? []) {
    if (seen.has(lease.tenant_id)) continue;
    seen.add(lease.tenant_id);
    const unit = unitMap.get(lease.unit_id);
    const tenantProfile = tenantMap.get(lease.tenant_id);
    results.push({
      tenantId: lease.tenant_id,
      tenantProfileId: tenantProfile?.id ?? '',
      leaseId: lease.id,
      fullName: tenantProfile?.full_name ?? tenantProfile?.email ?? 'Unknown',
      email: tenantProfile?.email ?? '',
      phone: tenantProfile?.phone ?? null,
      propertyName: unit ? (propertyNameMap.get(unit.property_id) ?? 'Unknown') : 'Unknown',
      unitNumber: unit?.unit_number ?? '-',
      leaseStatus: lease.status ?? 'unknown',
    });
  }

  return results;
}

export async function getLandlordTenants(profileId: string): Promise<LandlordTenantItem[]> {
  const landlordId = await getLandlordId(profileId);

  const { data: properties } = await supabase
    .from('properties')
    .select('id, property_name')
    .eq('landlord_id', landlordId);
  const propertyIds = (properties ?? []).map((p) => p.id);
  const propertyNameMap = new Map((properties ?? []).map((p) => [p.id, p.property_name]));
  if (propertyIds.length === 0) return [];

  const { data: units } = await supabase
    .from('units')
    .select('id, unit_number, property_id')
    .in('property_id', propertyIds);
  const unitIds = (units ?? []).map((u) => u.id);
  const unitMap = new Map((units ?? []).map((u) => [u.id, u]));
  if (unitIds.length === 0) return [];

  const { data: leases, error } = await supabase
    .from('leases')
    .select('id, tenant_id, unit_id, status')
    .in('unit_id', unitIds)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const tenantIds = Array.from(new Set((leases ?? []).map((l) => l.tenant_id)));
  if (tenantIds.length === 0) return [];

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, profiles!inner(id, full_name, email, phone)')
    .in('id', tenantIds);
  const tenantMap = new Map((tenants ?? []).map((t: any) => [t.id, t.profiles]));

  // Keep only the most recent lease per tenant (leases already sorted desc above)
  const seen = new Set<string>();
  const results: LandlordTenantItem[] = [];

  for (const lease of leases ?? []) {
    if (seen.has(lease.tenant_id)) continue;
    seen.add(lease.tenant_id);

    const unit = unitMap.get(lease.unit_id);
    const tenantProfile = tenantMap.get(lease.tenant_id);

    results.push({
      tenantId: lease.tenant_id,
      tenantProfileId: tenantProfile?.id ?? '',
      leaseId: lease.id,
      fullName: tenantProfile?.full_name ?? tenantProfile?.email ?? 'Unknown',
      email: tenantProfile?.email ?? '',
      phone: tenantProfile?.phone ?? null,
      propertyName: unit ? (propertyNameMap.get(unit.property_id) ?? 'Unknown') : 'Unknown',
      unitNumber: unit?.unit_number ?? '-',
      leaseStatus: lease.status ?? 'unknown',
    });
  }

  return results;
}
