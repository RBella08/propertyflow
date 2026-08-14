import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantMaintenanceRequests } from '@/features/maintenance/hooks/useMaintenance';
import { MaintenanceStatusBadge } from '@/features/maintenance/components/MaintenanceStatusBadge';

const STATUS_FILTERS = [
  'all',
  'submitted',
  'assigned',
  'in_progress',
  'completed',
  'closed',
] as const;

export function TenantMaintenancePage() {
  const { data: requests, isLoading } = useTenantMaintenanceRequests();
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');

  const filtered = requests?.filter((r) => statusFilter === 'all' || r.status === statusFilter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? 'default' : 'outline'}
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <Link key={r.id} to={`/tenant/maintenance/${r.id}`} className="block">
              <Card interactive>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{r.subject}</p>
                    <p className="text-small capitalize text-muted-foreground">
                      {r.category.replace('_', ' ')} · {r.priority} priority
                    </p>
                  </div>
                  <div className="shrink-0">
                    <MaintenanceStatusBadge status={r.status} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-card border py-16 text-center">
          <Wrench className="h-8 w-8 text-muted-foreground" />
          <p className="text-h5 text-foreground">No requests match this filter</p>
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
