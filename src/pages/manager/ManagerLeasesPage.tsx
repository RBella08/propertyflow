import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useManagerLeases } from '@/features/leases/hooks/useLeases';
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge';
import { RenewLeaseDialog } from '@/features/leases/components/RenewLeaseDialog';
import { TerminateLeaseDialog } from '@/features/leases/components/TerminateLeaseDialog';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_FILTERS = ['active', 'terminated', 'all'] as const;

export function ManagerLeasesPage() {
  const { data: leases, isLoading } = useManagerLeases();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('active');
  const [renewTarget, setRenewTarget] = useState<{
    id: string;
    number: string;
    endDate: string;
  } | null>(null);
  const [terminateTarget, setTerminateTarget] = useState<{ id: string; number: string } | null>(
    null
  );

  const filtered = leases?.filter((l) => {
    const matchesSearch =
      l.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      l.propertyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
          ? l.status !== 'terminated'
          : l.status === 'terminated';
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h4 text-foreground">Leases</h1>
          <p className="text-muted-foreground">Leases across your assigned properties.</p>
        </div>
        <Button asChild>
          <Link to="/manager/leases/new">
            <Plus className="mr-2 h-4 w-4" /> Create Lease
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by tenant or property..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {STATUS_FILTERS.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((lease) => (
            <Card key={lease.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">
                    {lease.leaseNumber} — {lease.tenantName}
                  </p>
                  <p className="text-small text-muted-foreground">
                    {lease.propertyName} · Unit {lease.unitNumber} ·{' '}
                    {formatNaira(lease.monthlyRent)}/yr
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {lease.startDate} → {lease.endDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <LeaseStatusBadge status={lease.status} />
                  {lease.status !== 'terminated' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setRenewTarget({
                            id: lease.id,
                            number: lease.leaseNumber,
                            endDate: lease.endDate,
                          })
                        }
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() =>
                          setTerminateTarget({ id: lease.id, number: lease.leaseNumber })
                        }
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No leases match your filters.</p>
      )}

      <RenewLeaseDialog
        leaseId={renewTarget?.id ?? null}
        leaseNumber={renewTarget?.number ?? ''}
        currentEndDate={renewTarget?.endDate ?? ''}
        onClose={() => setRenewTarget(null)}
      />
      <TerminateLeaseDialog
        leaseId={terminateTarget?.id ?? null}
        leaseNumber={terminateTarget?.number ?? ''}
        onClose={() => setTerminateTarget(null)}
      />
    </div>
  );
}
