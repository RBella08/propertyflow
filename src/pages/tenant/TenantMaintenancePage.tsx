import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantMaintenanceRequests } from '@/features/maintenance/hooks/useMaintenance';
import { MaintenanceStatusBadge } from '@/features/maintenance/components/MaintenanceStatusBadge';

export function TenantMaintenancePage() {
  const { data: requests, isLoading } = useTenantMaintenanceRequests();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h4 text-foreground">Maintenance</h1>
          <p className="text-muted-foreground">Track and report issues with your unit.</p>
        </div>
        <Button asChild>
          <Link to="/tenant/maintenance/new">
            <Plus className="mr-2 h-4 w-4" /> New Request
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : requests && requests.length > 0 ? (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <Link key={r.id} to={`/tenant/maintenance/${r.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-foreground">{r.subject}</p>
                    <p className="text-small capitalize text-muted-foreground">
                      {r.category.replace('_', ' ')} · {r.priority} priority
                    </p>
                  </div>
                  <MaintenanceStatusBadge status={r.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-h5 text-foreground">No maintenance requests yet</p>
          <Button asChild>
            <Link to="/tenant/maintenance/new">
              <Plus className="mr-2 h-4 w-4" /> Report an Issue
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
