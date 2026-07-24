import { supabase } from '@/lib/supabase';

export interface AdminDashboardStats {
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  totalLandlords: number;
  totalRevenue: number;
  openMaintenanceCount: number;
}

export interface AdminDashboardStats {
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  activeTenants: number;
  totalLandlords: number;
  totalRevenue: number;
  openMaintenanceCount: number;
}

export interface AdminDashboardStats {
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  activeTenants: number;
  totalLandlords: number;
  totalManagers: number;
  totalRevenue: number;
  pendingRevenue: number;
  refundedAmount: number;
  openMaintenanceCount: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    { count: totalProperties },
    { count: totalUnits },
    { count: totalTenants },
    { count: totalLandlords },
    { count: totalManagers },
    { count: openMaintenanceCount },
    { data: allPayments },
    { data: activeLeases },
  ] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }),
    supabase.from('units').select('id', { count: 'exact', head: true }),
    // Current role, not historical table membership — fixes the stale-count bug
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'tenant'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'landlord'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'manager'),
    supabase
      .from('maintenance_requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['submitted', 'assigned', 'in_progress']),
    supabase.from('payments').select('amount, status'),
    supabase.from('leases').select('tenant_id').eq('status', 'active'),
  ]);

  const totalRevenue = (allPayments ?? [])
    .filter((p) => p.status === 'successful')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = (allPayments ?? [])
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const refundedAmount = (allPayments ?? [])
    .filter((p) => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeTenants = new Set((activeLeases ?? []).map((l) => l.tenant_id)).size;

  return {
    totalProperties: totalProperties ?? 0,
    totalUnits: totalUnits ?? 0,
    totalTenants: totalTenants ?? 0,
    activeTenants,
    totalLandlords: totalLandlords ?? 0,
    totalManagers: totalManagers ?? 0,
    totalRevenue,
    pendingRevenue,
    refundedAmount,
    openMaintenanceCount: openMaintenanceCount ?? 0,
  };
}

export async function adminUpdatePaymentStatus(
  reference: string,
  status: 'pending' | 'processing' | 'successful' | 'failed' | 'refunded'
): Promise<void> {
  const { error } = await supabase.from('payments').update({ status }).eq('reference', reference);
  if (error) throw error;
}

export interface AdminPropertyItem {
  id: string;
  propertyName: string;
  city: string;
  state: string;
  status: string;
  landlordName: string;
  totalUnits: number;
}

export async function getAllProperties(): Promise<AdminPropertyItem[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(
      'id, property_name, city, state, status, units(id), landlords!inner(profiles!inner(full_name, email))'
    )
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    propertyName: row.property_name,
    city: row.city,
    state: row.state,
    status: row.status,
    landlordName: row.landlords.profiles.full_name ?? row.landlords.profiles.email,
    totalUnits: row.units?.length ?? 0,
  }));
}

export interface AdminUnitItem {
  id: string;
  propertyName: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  status: string;
}

export async function getAllUnits(): Promise<AdminUnitItem[]> {
  const { data, error } = await supabase
    .from('units')
    .select(
      'id, unit_number, bedrooms, bathrooms, rent_amount, status, properties!inner(property_name)'
    )
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    propertyName: row.properties.property_name,
    unitNumber: row.unit_number,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    rentAmount: row.rent_amount,
    status: row.status,
  }));
}

export interface AdminLeaseItem {
  id: string;
  leaseNumber: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  monthlyRent: number;
  status: string;
}

export async function getAllLeases(): Promise<AdminLeaseItem[]> {
  const { data, error } = await supabase
    .from('leases')
    .select(
      `id, lease_number, monthly_rent, status,
       units!inner(unit_number, properties!inner(property_name)),
       tenants!inner(profiles!inner(full_name, email))`
    )
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    leaseNumber: row.lease_number,
    tenantName: row.tenants.profiles.full_name ?? row.tenants.profiles.email,
    propertyName: row.units.properties.property_name,
    unitNumber: row.units.unit_number,
    monthlyRent: row.monthly_rent,
    status: row.status,
  }));
}

export interface AdminPaymentItem {
  reference: string;
  tenantName: string;
  amount: number;
  gateway: string;
  status: string;
  paidAt: string | null;
}

export async function getAllPayments(): Promise<AdminPaymentItem[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(
      'reference, amount, gateway, status, paid_at, tenants!inner(profiles!inner(full_name, email))'
    )
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    reference: row.reference,
    tenantName: row.tenants.profiles.full_name ?? row.tenants.profiles.email,
    amount: row.amount,
    gateway: row.gateway,
    status: row.status,
    paidAt: row.paid_at,
  }));
}

export interface AdminMaintenanceItem {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  propertyName: string;
  tenantName: string;
  createdAt: string;
}

export async function getAllMaintenance(): Promise<AdminMaintenanceItem[]> {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(
      `id, subject, category, priority, status, created_at,
       properties!inner(property_name),
       tenants!inner(profiles!inner(full_name, email))`
    )
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    subject: row.subject,
    category: row.category,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    propertyName: row.properties.property_name,
    tenantName: row.tenants.profiles.full_name ?? row.tenants.profiles.email,
  }));
}

export async function adminSetMaintenanceStatus(
  requestId: string,
  status: 'submitted' | 'assigned' | 'in_progress' | 'waiting_parts' | 'completed' | 'closed'
): Promise<void> {
  const { error } = await supabase
    .from('maintenance_requests')
    .update({
      status,
      resolved_at: status === 'completed' || status === 'closed' ? new Date().toISOString() : null,
    })
    .eq('id', requestId);

  if (error) throw error;
}
