import { Building2, DoorClosed, Wrench, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useManagerDashboard } from '@/features/properties/hooks/useManagerProperties';

export function ManagerDashboardPage() {
  const { data, isLoading, isError } = useManagerDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-destructive">Couldn&apos;t load your dashboard. Please refresh.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Manager Dashboard</h1>
        <p className="text-muted-foreground">An overview of the properties assigned to you.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Assigned Properties"
          value={String(data.totalProperties)}
          icon={Building2}
        />
        <StatsCard title="Total Units" value={String(data.totalUnits)} icon={DoorClosed} />
        <StatsCard
          title="Occupancy Rate"
          value={`${data.occupancyRate}%`}
          icon={TrendingUp}
          tone={data.occupancyRate >= 70 ? 'success' : 'warning'}
        />
        <StatsCard
          title="Open Maintenance"
          value={String(data.openMaintenanceCount)}
          icon={Wrench}
          tone={data.openMaintenanceCount > 0 ? 'warning' : 'success'}
        />
      </div>

      {data.totalProperties === 0 && (
        <p className="text-muted-foreground">
          No properties are assigned to you yet — ask a landlord to assign you from their Properties
          page.
        </p>
      )}
    </div>
  );
}
