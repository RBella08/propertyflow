import { Building2, DoorClosed, Wallet, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';
import { OccupancyChart } from '@/features/dashboard/components/OccupancyChart';
import { LandlordMaintenanceList } from '@/features/dashboard/components/LandlordMaintenanceList';
import { LandlordQuickActions } from '@/features/dashboard/components/LandlordQuickActions';
import { Skeleton } from '@/components/ui/skeleton';
import { PayoutSetupBanner } from '@/features/payouts/components/PayoutSetupBanner';
import { useLandlordDashboard } from '@/features/dashboard/hooks/useLandlordDashboard';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function LandlordDashboardPage() {
  const { data, isLoading, isError } = useLandlordDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-destructive">Couldn&apos;t load your dashboard. Please refresh.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Portfolio Overview</h1>
        <p className="text-muted-foreground">A snapshot of your properties and revenue.</p>
      </div>

      <PayoutSetupBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Properties" value={String(data.totalProperties)} icon={Building2} />
        <StatsCard title="Total Units" value={String(data.totalUnits)} icon={DoorClosed} />
        <StatsCard
          title="Total Revenue"
          value={formatNaira(data.totalRevenue)}
          icon={TrendingUp}
          tone="success"
        />
        <StatsCard
          title="Outstanding Balance"
          value={formatNaira(data.outstandingBalance)}
          icon={Wallet}
          tone={data.outstandingBalance > 0 ? 'warning' : 'success'}
        />
      </div>

      <LandlordQuickActions />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={data.revenueByMonth} />
        </div>
        <OccupancyChart data={data.occupancyBreakdown} occupancyRate={data.occupancyRate} />
      </div>

      <LandlordMaintenanceList requests={data.recentMaintenance} />
    </div>
  );
}
