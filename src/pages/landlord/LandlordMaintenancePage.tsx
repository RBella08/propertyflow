import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/database';
import { useLandlordMaintenanceRequests } from '@/features/maintenance/hooks/useMaintenance';
import { useUpdateMaintenanceStatus } from '@/features/maintenance/hooks/useMaintenanceMutations';
import { MaintenanceStatusBadge } from '@/features/maintenance/components/MaintenanceStatusBadge';

type MaintenanceStatus = Database['public']['Enums']['maintenance_status'];

const NEXT_STATUS: Partial<Record<MaintenanceStatus, MaintenanceStatus>> = {
  submitted: 'assigned',
  assigned: 'in_progress',
  in_progress: 'completed',
  completed: 'closed',
};

const NEXT_LABEL: Partial<Record<MaintenanceStatus, string>> = {
  submitted: 'Assign',
  assigned: 'Start Work',
  in_progress: 'Mark Completed',
  completed: 'Close',
};

export function LandlordMaintenancePage() {
  const { data: requests, isLoading } = useLandlordMaintenanceRequests();
  const updateStatus = useUpdateMaintenanceStatus();

  const handleAdvance = async (requestId: string, currentStatus: MaintenanceStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus];

    if (!nextStatus) return;

    try {
      await updateStatus.mutateAsync({
        requestId,
        status: nextStatus,
      });

      toast.success(`Status updated to "${nextStatus.replace('_', ' ')}"`);
    } catch (error) {
      toast.error('Could not update status', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Maintenance Requests</h1>
        <p className="text-muted-foreground">Track and resolve issues across your properties.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : requests && requests.length > 0 ? (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">{r.subject}</p>

                  <p className="text-small text-muted-foreground">
                    {r.propertyName} · Unit {r.unitNumber} · {r.tenantName}
                  </p>

                  <p className="text-caption capitalize text-muted-foreground">
                    {r.category.replace('_', ' ')} · {r.priority} priority
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <MaintenanceStatusBadge status={r.status} />

                  {NEXT_STATUS[r.status as MaintenanceStatus] && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdvance(r.id, r.status as MaintenanceStatus)}
                    >
                      {NEXT_LABEL[r.status as MaintenanceStatus]}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No maintenance requests yet.</p>
      )}
    </div>
  );
}
