import {
  Building2,
  DoorClosed,
  Users,
  UserCheck,
  UserCog,
  Briefcase,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminDashboardStats } from '@/features/admin/hooks/useAdminOversight';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground">
          A snapshot of everything happening across PropertyFlow.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Properties"
          value={String(stats?.totalProperties ?? 0)}
          icon={Building2}
        />
        <StatsCard title="Total Units" value={String(stats?.totalUnits ?? 0)} icon={DoorClosed} />
        <StatsCard
          title="Registered Tenants"
          value={String(stats?.totalTenants ?? 0)}
          icon={Users}
        />
        <StatsCard
          title="Currently Housed"
          value={String(stats?.activeTenants ?? 0)}
          icon={UserCheck}
          tone="success"
        />
        <StatsCard title="Landlords" value={String(stats?.totalLandlords ?? 0)} icon={UserCog} />
        <StatsCard
          title="Estate Managers"
          value={String(stats?.totalManagers ?? 0)}
          icon={Briefcase}
        />
        <StatsCard
          title="Confirmed Revenue"
          value={formatNaira(stats?.totalRevenue ?? 0)}
          icon={TrendingUp}
          tone="success"
        />
        <StatsCard
          title="Pending Revenue"
          value={formatNaira(stats?.pendingRevenue ?? 0)}
          icon={TrendingUp}
          tone="warning"
        />
        <StatsCard
          title="Open Maintenance"
          value={String(stats?.openMaintenanceCount ?? 0)}
          icon={Wrench}
          tone={(stats?.openMaintenanceCount ?? 0) > 0 ? 'warning' : 'success'}
        />
      </div>

      {(stats?.refundedAmount ?? 0) > 0 && (
        <p className="text-small text-muted-foreground">
          {formatNaira(stats?.refundedAmount ?? 0)} has been refunded and is excluded from Confirmed
          Revenue above.
        </p>
      )}
    </div>
  );
}
