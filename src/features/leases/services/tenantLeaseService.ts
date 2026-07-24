import { supabase } from '@/lib/supabase';

export interface TenantLeaseItem {
  id: string;
  leaseNumber: string;
  propertyName: string;
  propertyAddress: string;
  city: string;
  state: string;
  unitNumber: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  billingCycle: string;
  status: string;
}

export async function getTenantLeases(tenantId: string): Promise<TenantLeaseItem[]> {
  const { data, error } = await supabase
    .from('leases')
    .select(
      `id, lease_number, start_date, end_date, monthly_rent, security_deposit, billing_cycle, status,
       units!inner(unit_number, properties!inner(property_name, address, city, state))`
    )
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    leaseNumber: row.lease_number,
    propertyName: row.units.properties.property_name,
    propertyAddress: row.units.properties.address,
    city: row.units.properties.city,
    state: row.units.properties.state,
    unitNumber: row.units.unit_number,
    startDate: row.start_date,
    endDate: row.end_date,
    monthlyRent: row.monthly_rent,
    securityDeposit: row.security_deposit,
    billingCycle: row.billing_cycle,
    status: row.status,
  }));
}
