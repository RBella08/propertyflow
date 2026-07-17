import { supabase } from '@/lib/supabase';

export interface ActiveLease {
  id: string;
  leaseNumber: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: string | null;
}

export interface RecentPayment {
  id: string;
  amount: number;
  gateway: string;
  reference: string;
  status: string | null;
  paidAt: string | null;
}

export interface MaintenanceSummaryItem {
  id: string;
  subject: string;
  status: string | null;
  createdAt: string | null;
}

export interface RecentNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean | null;
  createdAt: string | null;
}

export interface TenantDashboardData {
  activeLease: ActiveLease | null;
  outstandingBalance: number;
  recentPayments: RecentPayment[];
  maintenanceRequests: MaintenanceSummaryItem[];
  openMaintenanceCount: number;
  notifications: RecentNotification[];
}

export async function getTenantDashboardData(profileId: string): Promise<TenantDashboardData> {
  const { data: tenantRow, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  // No tenant record yet (e.g. brand-new account, not assigned a lease) —
  // return a fully "empty" dashboard instead of throwing, so the page
  // still renders a helpful empty state.
  if (tenantError || !tenantRow) {
    return {
      activeLease: null,
      outstandingBalance: 0,
      recentPayments: [],
      maintenanceRequests: [],
      openMaintenanceCount: 0,
      notifications: [],
    };
  }

  const tenantId = tenantRow.id;

  const [leaseRes, invoicesRes, paymentsRes, maintenanceRes, notificationsRes] = await Promise.all([
    supabase
      .from('leases')
      .select('id, lease_number, start_date, end_date, monthly_rent, status')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .maybeSingle(),
    supabase
      .from('invoices')
      .select('balance, status, lease_id, leases!inner(tenant_id)')
      .eq('leases.tenant_id', tenantId)
      .in('status', ['pending', 'partial', 'overdue']),
    supabase
      .from('payments')
      .select('id, amount, gateway, reference, status, paid_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('maintenance_requests')
      .select('id, subject, status, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('notifications')
      .select('id, title, message, is_read, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (leaseRes.error) throw leaseRes.error;
  if (invoicesRes.error) throw invoicesRes.error;
  if (paymentsRes.error) throw paymentsRes.error;
  if (maintenanceRes.error) throw maintenanceRes.error;
  if (notificationsRes.error) throw notificationsRes.error;

  const outstandingBalance = (invoicesRes.data ?? []).reduce(
    (sum, inv) => sum + (inv.balance ?? 0),
    0
  );

  const openStatuses = ['submitted', 'assigned', 'in_progress'];
  const allMaintenance = maintenanceRes.data ?? [];

  return {
    activeLease: leaseRes.data
      ? {
          id: leaseRes.data.id,
          leaseNumber: leaseRes.data.lease_number,
          startDate: leaseRes.data.start_date,
          endDate: leaseRes.data.end_date,
          monthlyRent: leaseRes.data.monthly_rent,
          status: leaseRes.data.status,
        }
      : null,
    outstandingBalance,
    recentPayments: (paymentsRes.data ?? []).map((p) => ({
      id: p.id,
      amount: p.amount,
      gateway: p.gateway,
      reference: p.reference,
      status: p.status,
      paidAt: p.paid_at,
    })),
    maintenanceRequests: allMaintenance.map((m) => ({
      id: m.id,
      subject: m.subject,
      status: m.status,
      createdAt: m.created_at,
    })),
    openMaintenanceCount: allMaintenance.filter((m) => m.status && openStatuses.includes(m.status))
      .length,
    notifications: (notificationsRes.data ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      isRead: n.is_read,
      createdAt: n.created_at,
    })),
  };
}
