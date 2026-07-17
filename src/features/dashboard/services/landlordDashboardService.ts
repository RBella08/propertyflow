import { supabase } from '@/lib/supabase';

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface OccupancySlice {
  name: string;
  value: number;
}

export interface LandlordMaintenanceItem {
  id: string;
  subject: string;
  status: string | null;
  priority: string | null;
  createdAt: string | null;
}

export interface LandlordDashboardData {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalRevenue: number;
  outstandingBalance: number;
  revenueByMonth: RevenuePoint[];
  occupancyBreakdown: OccupancySlice[];
  recentMaintenance: LandlordMaintenanceItem[];
}

function emptyDashboard(): LandlordDashboardData {
  return {
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    occupancyRate: 0,
    totalRevenue: 0,
    outstandingBalance: 0,
    revenueByMonth: [],
    occupancyBreakdown: [],
    recentMaintenance: [],
  };
}

export async function getLandlordDashboardData(profileId: string): Promise<LandlordDashboardData> {
  const { data: landlordRow, error: landlordError } = await supabase
    .from('landlords')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  if (landlordError || !landlordRow) return emptyDashboard();
  const landlordId = landlordRow.id;

  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('id')
    .eq('landlord_id', landlordId);
  if (propertiesError) throw propertiesError;

  const propertyIds = (properties ?? []).map((p) => p.id);
  if (propertyIds.length === 0) return emptyDashboard();

  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('id, property_id, status')
    .in('property_id', propertyIds);
  if (unitsError) throw unitsError;

  const unitIds = (units ?? []).map((u) => u.id);

  const { data: leases, error: leasesError } = unitIds.length
    ? await supabase.from('leases').select('id, unit_id').in('unit_id', unitIds)
    : { data: [] as { id: string; unit_id: string }[], error: null };
  if (leasesError) throw leasesError;

  const leaseIds = (leases ?? []).map((l) => l.id);

  const { data: invoices, error: invoicesError } = leaseIds.length
    ? await supabase
        .from('invoices')
        .select('id, lease_id, balance, status')
        .in('lease_id', leaseIds)
    : {
        data: [] as { id: string; lease_id: string; balance: number; status: string }[],
        error: null,
      };
  if (invoicesError) throw invoicesError;

  const invoiceIds = (invoices ?? []).map((i) => i.id);

  const { data: payments, error: paymentsError } = invoiceIds.length
    ? await supabase
        .from('payments')
        .select('id, invoice_id, amount, paid_at, created_at')
        .in('invoice_id', invoiceIds)
        .eq('status', 'successful')
    : {
        data: [] as {
          id: string;
          invoice_id: string;
          amount: number;
          paid_at: string | null;
          created_at: string;
        }[],
        error: null,
      };
  if (paymentsError) throw paymentsError;

  const { data: maintenance, error: maintenanceError } = await supabase
    .from('maintenance_requests')
    .select('id, subject, status, priority, created_at')
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false })
    .limit(5);
  if (maintenanceError) throw maintenanceError;

  const totalUnits = units?.length ?? 0;
  const occupiedUnits = (units ?? []).filter((u) => u.status === 'occupied').length;
  const vacantUnits = (units ?? []).filter((u) => u.status === 'available').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const now = new Date();
  const months: { year: number; month: number; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleString('en-US', { month: 'short' }),
    });
  }

  const revenueByMonth: RevenuePoint[] = months.map(({ year, month, label }) => {
    const total = (payments ?? [])
      .filter((p) => {
        const date = new Date(p.paid_at ?? p.created_at ?? new Date().toISOString());
        return date.getFullYear() === year && date.getMonth() === month;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    return { month: label, revenue: total };
  });

  const totalRevenue = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const outstandingBalance = (invoices ?? [])
    .filter((i) => ['pending', 'partial', 'overdue'].includes(i.status ?? ''))
    .reduce((sum, i) => sum + (i.balance ?? 0), 0);

  return {
    totalProperties: propertyIds.length,
    totalUnits,
    occupiedUnits,
    vacantUnits,
    occupancyRate,
    totalRevenue,
    outstandingBalance,
    revenueByMonth,
    occupancyBreakdown: [
      { name: 'Occupied', value: occupiedUnits },
      { name: 'Vacant', value: vacantUnits },
    ],
    recentMaintenance: (maintenance ?? []).map((m) => ({
      id: m.id,
      subject: m.subject,
      status: m.status,
      priority: m.priority,
      createdAt: m.created_at,
    })),
  };
}
