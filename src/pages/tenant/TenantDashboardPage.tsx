import { Wallet, FileSignature, Wrench } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentPaymentsTable } from '@/features/dashboard/components/RecentPaymentsTable';
import { MaintenanceSummaryList } from '@/features/dashboard/components/MaintenanceSummaryList';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantDashboard } from '@/features/dashboard/hooks/useTenantDashboard';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TenantDashboardPage() {
  const { data, isLoading, isError } = useTenantDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-destructive">Couldn&apos;t load your dashboard. Please refresh.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Welcome back</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your tenancy.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Active Lease"
          value={data.activeLease ? data.activeLease.leaseNumber : 'None'}
          icon={FileSignature}
          tone={data.activeLease ? 'success' : 'default'}
        />
        <StatsCard
          title="Outstanding Balance"
          value={formatNaira(data.outstandingBalance)}
          icon={Wallet}
          tone={data.outstandingBalance > 0 ? 'warning' : 'success'}
        />
        <StatsCard
          title="Open Maintenance"
          value={String(data.openMaintenanceCount)}
          icon={Wrench}
          tone={data.openMaintenanceCount > 0 ? 'warning' : 'success'}
        />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentPaymentsTable payments={data.recentPayments} />
        <MaintenanceSummaryList requests={data.maintenanceRequests} />
      </div>
    </div>
  );
}
