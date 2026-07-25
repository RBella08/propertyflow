import { supabase } from '@/lib/supabase';
import { getLandlordId } from '@/features/properties/services/propertyManagementService';

export interface RevenueReportRow {
  month: string;
  revenue: number;
}

export interface OccupancyReportRow {
  propertyName: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
}

export interface PaymentSummaryRow {
  reference: string;
  tenantName: string;
  propertyName: string;
  amount: number;
  status: string;
  paidAt: string | null;
}

// Plain date strings like "2026-07-25" default to midnight when compared
// against a timestamp column — this pushes the end boundary to the very
// end of that day instead, so "today" actually includes all of today.
function endOfDay(dateStr: string): string {
  return `${dateStr}T23:59:59.999`;
}

async function getLandlordScopeIds(landlordId: string) {
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, property_name')
    .eq('landlord_id', landlordId);
  if (error) throw error;

  const propertyIds = (properties ?? []).map((p) => p.id);
  const propertyNameMap = new Map((properties ?? []).map((p) => [p.id, p.property_name]));

  const { data: units } = propertyIds.length
    ? await supabase.from('units').select('id, property_id, status').in('property_id', propertyIds)
    : { data: [] as { id: string; property_id: string; status: string }[] };

  return { propertyIds, propertyNameMap, units: units ?? [] };
}

async function getManagerScopeIds(profileId: string) {
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, property_name')
    .eq('manager_id', profileId);
  if (error) throw error;

  const propertyIds = (properties ?? []).map((p) => p.id);
  const propertyNameMap = new Map((properties ?? []).map((p) => [p.id, p.property_name]));

  const { data: units } = propertyIds.length
    ? await supabase.from('units').select('id, property_id, status').in('property_id', propertyIds)
    : { data: [] as { id: string; property_id: string; status: string }[] };

  return { propertyIds, propertyNameMap, units: units ?? [] };
}

export async function getRevenueReport(
  profileId: string,
  startDate: string,
  endDate: string
): Promise<RevenueReportRow[]> {
  const landlordId = await getLandlordId(profileId);
  const { propertyIds } = await getLandlordScopeIds(landlordId);
  if (propertyIds.length === 0) return [];

  const { data: units } = await supabase.from('units').select('id').in('property_id', propertyIds);
  const unitIds = (units ?? []).map((u) => u.id);
  if (unitIds.length === 0) return [];

  const { data: leases } = await supabase.from('leases').select('id').in('unit_id', unitIds);
  const leaseIds = (leases ?? []).map((l) => l.id);
  if (leaseIds.length === 0) return [];

  const { data: invoices } = await supabase.from('invoices').select('id').in('lease_id', leaseIds);
  const invoiceIds = (invoices ?? []).map((i) => i.id);
  if (invoiceIds.length === 0) return [];

  const { data: payments, error } = await supabase
    .from('payments')
    .select('amount, paid_at, created_at')
    .in('invoice_id', invoiceIds)
    .eq('status', 'successful')
    .gte('created_at', startDate)
    .lte('created_at', endOfDay(endDate));
  if (error) throw error;

  const monthMap = new Map<string, number>();
  (payments ?? []).forEach((p) => {
    const date = new Date(p.paid_at || p.created_at || Date.now());
    const key = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthMap.set(key, (monthMap.get(key) ?? 0) + p.amount);
  });

  return Array.from(monthMap.entries()).map(([month, revenue]) => ({ month, revenue }));
}

export async function getOccupancyReport(profileId: string): Promise<OccupancyReportRow[]> {
  const landlordId = await getLandlordId(profileId);
  const { propertyNameMap, units } = await getLandlordScopeIds(landlordId);

  const grouped = new Map<string, { total: number; occupied: number }>();
  units.forEach((u) => {
    const current = grouped.get(u.property_id) ?? { total: 0, occupied: 0 };
    current.total += 1;
    if (u.status === 'occupied') current.occupied += 1;
    grouped.set(u.property_id, current);
  });

  return Array.from(grouped.entries()).map(([propertyId, stats]) => ({
    propertyName: propertyNameMap.get(propertyId) ?? 'Unknown',
    totalUnits: stats.total,
    occupiedUnits: stats.occupied,
    vacantUnits: stats.total - stats.occupied,
    occupancyRate: stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0,
  }));
}

export async function getPaymentSummaryReport(
  profileId: string,
  startDate: string,
  endDate: string
): Promise<PaymentSummaryRow[]> {
  const landlordId = await getLandlordId(profileId);
  const { propertyIds, propertyNameMap } = await getLandlordScopeIds(landlordId);
  if (propertyIds.length === 0) return [];

  const { data: units } = await supabase
    .from('units')
    .select('id, property_id')
    .in('property_id', propertyIds);
  const unitIds = (units ?? []).map((u) => u.id);
  const unitPropertyMap = new Map((units ?? []).map((u) => [u.id, u.property_id]));
  if (unitIds.length === 0) return [];

  const { data: leases } = await supabase
    .from('leases')
    .select('id, unit_id, tenant_id')
    .in('unit_id', unitIds);
  const leaseIds = (leases ?? []).map((l) => l.id);
  const leaseMap = new Map((leases ?? []).map((l) => [l.id, l]));
  if (leaseIds.length === 0) return [];

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, lease_id')
    .in('lease_id', leaseIds);
  const invoiceIds = (invoices ?? []).map((i) => i.id);
  const invoiceLeaseMap = new Map((invoices ?? []).map((i) => [i.id, i.lease_id]));
  if (invoiceIds.length === 0) return [];

  const { data: payments, error } = await supabase
    .from('payments')
    .select('reference, amount, status, paid_at, invoice_id, created_at')
    .in('invoice_id', invoiceIds)
    .gte('created_at', startDate)
    .lte('created_at', endOfDay(endDate))
    .order('created_at', { ascending: false });
  if (error) throw error;

  const tenantIds = Array.from(new Set((leases ?? []).map((l) => l.tenant_id)));
  const { data: tenants } = tenantIds.length
    ? await supabase
        .from('tenants')
        .select('id, profiles!inner(full_name, email)')
        .in('id', tenantIds)
    : { data: [] as any[] };
  const tenantNameMap = new Map(
    (tenants ?? []).map((t: any) => [t.id, t.profiles.full_name ?? t.profiles.email])
  );

  return (payments ?? []).map((p) => {
    const leaseId = invoiceLeaseMap.get(p.invoice_id);
    const lease = leaseId ? leaseMap.get(leaseId) : undefined;
    const propertyId = lease ? unitPropertyMap.get(lease.unit_id) : undefined;

    return {
      reference: p.reference,
      tenantName: lease ? (tenantNameMap.get(lease.tenant_id) ?? 'Unknown') : 'Unknown',
      propertyName: propertyId ? (propertyNameMap.get(propertyId) ?? 'Unknown') : 'Unknown',
      amount: p.amount,
      status: p.status || 'pending',
      paidAt: p.paid_at,
    };
  });
}

export async function getRevenueReportForManager(
  profileId: string,
  startDate: string,
  endDate: string
): Promise<RevenueReportRow[]> {
  const { propertyIds } = await getManagerScopeIds(profileId);
  if (propertyIds.length === 0) return [];

  const { data: units } = await supabase.from('units').select('id').in('property_id', propertyIds);
  const unitIds = (units ?? []).map((u) => u.id);
  if (unitIds.length === 0) return [];

  const { data: leases } = await supabase.from('leases').select('id').in('unit_id', unitIds);
  const leaseIds = (leases ?? []).map((l) => l.id);
  if (leaseIds.length === 0) return [];

  const { data: invoices } = await supabase.from('invoices').select('id').in('lease_id', leaseIds);
  const invoiceIds = (invoices ?? []).map((i) => i.id);
  if (invoiceIds.length === 0) return [];

  const { data: payments, error } = await supabase
    .from('payments')
    .select('amount, paid_at, created_at')
    .in('invoice_id', invoiceIds)
    .eq('status', 'successful')
    .gte('created_at', startDate)
    .lte('created_at', endOfDay(endDate));
  if (error) throw error;

  const monthMap = new Map<string, number>();
  (payments ?? []).forEach((p) => {
    const date = new Date(p.paid_at || p.created_at || Date.now());
    const key = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthMap.set(key, (monthMap.get(key) ?? 0) + p.amount);
  });

  return Array.from(monthMap.entries()).map(([month, revenue]) => ({ month, revenue }));
}

export async function getOccupancyReportForManager(
  profileId: string
): Promise<OccupancyReportRow[]> {
  const { propertyNameMap, units } = await getManagerScopeIds(profileId);

  const grouped = new Map<string, { total: number; occupied: number }>();
  units.forEach((u) => {
    const current = grouped.get(u.property_id) ?? { total: 0, occupied: 0 };
    current.total += 1;
    if (u.status === 'occupied') current.occupied += 1;
    grouped.set(u.property_id, current);
  });

  return Array.from(grouped.entries()).map(([propertyId, stats]) => ({
    propertyName: propertyNameMap.get(propertyId) ?? 'Unknown',
    totalUnits: stats.total,
    occupiedUnits: stats.occupied,
    vacantUnits: stats.total - stats.occupied,
    occupancyRate: stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0,
  }));
}

export async function getPaymentSummaryReportForManager(
  profileId: string,
  startDate: string,
  endDate: string
): Promise<PaymentSummaryRow[]> {
  const { propertyIds, propertyNameMap } = await getManagerScopeIds(profileId);
  if (propertyIds.length === 0) return [];

  const { data: units } = await supabase
    .from('units')
    .select('id, property_id')
    .in('property_id', propertyIds);
  const unitIds = (units ?? []).map((u) => u.id);
  const unitPropertyMap = new Map((units ?? []).map((u) => [u.id, u.property_id]));
  if (unitIds.length === 0) return [];

  const { data: leases } = await supabase
    .from('leases')
    .select('id, unit_id, tenant_id')
    .in('unit_id', unitIds);
  const leaseIds = (leases ?? []).map((l) => l.id);
  const leaseMap = new Map((leases ?? []).map((l) => [l.id, l]));
  if (leaseIds.length === 0) return [];

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, lease_id')
    .in('lease_id', leaseIds);
  const invoiceIds = (invoices ?? []).map((i) => i.id);
  const invoiceLeaseMap = new Map((invoices ?? []).map((i) => [i.id, i.lease_id]));
  if (invoiceIds.length === 0) return [];

  const { data: payments, error } = await supabase
    .from('payments')
    .select('reference, amount, status, paid_at, invoice_id, created_at')
    .in('invoice_id', invoiceIds)
    .gte('created_at', startDate)
    .lte('created_at', endOfDay(endDate))
    .order('created_at', { ascending: false });
  if (error) throw error;

  const tenantIds = Array.from(new Set((leases ?? []).map((l) => l.tenant_id)));
  const { data: tenants } = tenantIds.length
    ? await supabase
        .from('tenants')
        .select('id, profiles!inner(full_name, email)')
        .in('id', tenantIds)
    : { data: [] as any[] };
  const tenantNameMap = new Map(
    (tenants ?? []).map((t: any) => [t.id, t.profiles.full_name ?? t.profiles.email])
  );

  return (payments ?? []).map((p) => {
    const leaseId = invoiceLeaseMap.get(p.invoice_id);
    const lease = leaseId ? leaseMap.get(leaseId) : undefined;
    const propertyId = lease ? unitPropertyMap.get(lease.unit_id) : undefined;

    return {
      reference: p.reference,
      tenantName: lease ? (tenantNameMap.get(lease.tenant_id) ?? 'Unknown') : 'Unknown',
      propertyName: propertyId ? (propertyNameMap.get(propertyId) ?? 'Unknown') : 'Unknown',
      amount: p.amount,
      status: p.status || 'pending',
      paidAt: p.paid_at,
    };
  });
}
