import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MaintenanceStatusBadge } from '@/features/maintenance/components/MaintenanceStatusBadge';
import {
  useAdminAllMaintenance,
  useAdminSetMaintenanceStatus,
} from '@/features/admin/hooks/useAdminOversight';

const STATUS_FILTERS = [
  'all',
  'submitted',
  'assigned',
  'in_progress',
  'completed',
  'closed',
] as const;
const ALL_STATUSES = ['submitted', 'assigned', 'in_progress', 'completed', 'closed'];

export function AdminMaintenancePage() {
  const { data: requests, isLoading } = useAdminAllMaintenance();
  const setStatus = useAdminSetMaintenanceStatus();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');

  const filtered = requests?.filter((r) => {
    const matchesSearch =
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      r.propertyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleChange = async (
    requestId: string,
    status: 'submitted' | 'assigned' | 'in_progress' | 'waiting_parts' | 'completed' | 'closed'
  ) => {
    try {
      await setStatus.mutateAsync({ requestId, status });
      toast.success(`Status set to "${status.replace('_', ' ')}"`);
    } catch {
      toast.error('Could not update status');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">All Maintenance Requests</h1>
        <p className="text-muted-foreground">
          Every maintenance ticket across the platform. As an admin, you can freely set any status —
          including reversing a mistaken change.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by subject, tenant, or property..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
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
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">{r.subject}</p>
                  <p className="text-small text-muted-foreground">
                    {r.propertyName} · {r.tenantName}
                  </p>
                  <p className="text-caption capitalize text-muted-foreground">
                    {r.category.replace('_', ' ')} · {r.priority} priority
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MaintenanceStatusBadge status={r.status} />
                  <select
                    className="h-9 rounded-md border border-input bg-background px-2 text-small capitalize"
                    value={r.status}
                    onChange={(e) =>
                      handleChange(
                        r.id,
                        e.target.value as
                          | 'submitted'
                          | 'assigned'
                          | 'in_progress'
                          | 'waiting_parts'
                          | 'completed'
                          | 'closed'
                      )
                    }
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No requests match your filters.</p>
      )}
    </div>
  );
}
