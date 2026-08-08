import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLandlordLeases } from '@/features/leases/hooks/useLeases';
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge';
import { RenewLeaseDialog } from '@/features/leases/components/RenewLeaseDialog';
import { TerminateLeaseDialog } from '@/features/leases/components/TerminateLeaseDialog';
import { QuitNoticeStatusButton } from '@/features/quit-notices/components/QuitNoticeStatusButton';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function LandlordLeasesPage() {
  const { data: leases, isLoading } = useLandlordLeases();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'terminated'>('active');

  const filteredLeases = leases?.filter((l) =>
    statusFilter === 'all'
      ? true
      : statusFilter === 'active'
        ? l.status !== 'terminated'
        : l.status === 'terminated'
  );
  const [renewTarget, setRenewTarget] = useState<{
    id: string;
    number: string;
    endDate: string;
  } | null>(null);
  const [terminateTarget, setTerminateTarget] = useState<{ id: string; number: string } | null>(
    null
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h4 text-foreground">Leases</h1>
          <p className="text-muted-foreground">Manage tenant lease agreements.</p>
        </div>
        <Button asChild>
          <Link to="/landlord/leases/new">
            <Plus className="mr-2 h-4 w-4" /> Create Lease
          </Link>
        </Button>
        <div className="flex gap-2">
          {(['active', 'terminated', 'all'] as const).map((status) => (
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
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : leases && leases.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredLeases?.map((lease) => (
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
                      <QuitNoticeStatusButton
                        leaseId={lease.id}
                        tenantProfileId={lease.tenantProfileId}
                        tenantName={lease.tenantName}
                        propertyName={lease.propertyName}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-h5 text-foreground">No leases yet</p>
          <p className="text-muted-foreground">Create a lease to assign a tenant to a unit.</p>
          <Button asChild>
            <Link to="/landlord/leases/new">
              <Plus className="mr-2 h-4 w-4" /> Create Lease
            </Link>
          </Button>
        </div>
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
