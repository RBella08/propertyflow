import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Database } from '@/types/database';
import { useLandlordMaintenanceRequests } from '@/features/maintenance/hooks/useMaintenance';
import { useUpdateMaintenanceStatus } from '@/features/maintenance/hooks/useMaintenanceMutations';
import { MaintenanceStatusBadge } from '@/features/maintenance/components/MaintenanceStatusBadge';
import { useVendors, useAssignVendor } from '@/features/vendors/hooks/useVendors';

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

const STATUS_FILTERS = [
  'all',
  'submitted',
  'assigned',
  'in_progress',
  'completed',
  'closed',
] as const;

export function LandlordMaintenancePage() {
  const { data: requests, isLoading } = useLandlordMaintenanceRequests();
  const updateStatus = useUpdateMaintenanceStatus();
  const { data: vendors } = useVendors();
  const assignVendor = useAssignVendor();

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

  const handleAdvance = async (requestId: string, currentStatus: MaintenanceStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;

    try {
      await updateStatus.mutateAsync({ requestId, status: nextStatus });
      toast.success(`Status updated to "${nextStatus.replace('_', ' ')}"`);
    } catch (error) {
      toast.error('Could not update status', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  const handleAssignVendor = (requestId: string, vendorId: string) => {
    if (!vendorId) return;

    assignVendor.mutate(
      { requestId, vendorId },
      {
        onSuccess: () => toast.success('Vendor assigned'),
        onError: () => toast.error('Could not assign vendor'),
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Maintenance Requests</h1>
        <p className="text-muted-foreground">Track and resolve issues across your properties.</p>
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
        <Skeleton className="h-40" />
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
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

                <div className="flex flex-wrap items-center gap-2">
                  <MaintenanceStatusBadge status={r.status} />

                  <select
                    className="h-9 min-w-[132px] cursor-pointer rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm outline-none transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    defaultValue=""
                    onChange={(e) => handleAssignVendor(r.id, e.target.value)}
                  >
                    <option value="" disabled>
                      Assign vendor
                    </option>

                    {(vendors ?? []).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>

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
        <p className="text-muted-foreground">No maintenance requests match your filters.</p>
      )}
    </div>
  );
}
