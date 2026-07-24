import { MapPin, Calendar, Wallet, FileSignature } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantLeases } from '@/features/leases/hooks/useTenantLeases';
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TenantLeasePage() {
  const { data: leases, isLoading, isError } = useTenantLeases();

  if (isLoading) return <Skeleton className="h-96" />;
  if (isError)
    return <p className="text-destructive">Couldn&apos;t load your lease information.</p>;

  const activeLease = leases?.find((l) => l.status === 'active');
  const otherLeases = leases?.filter((l) => l.status !== 'active') ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">My Lease</h1>
        <p className="text-muted-foreground">Your current tenancy details.</p>
      </div>

      {activeLease ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-h5">{activeLease.propertyName}</CardTitle>
              <LeaseStatusBadge status={activeLease.status} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="flex items-center gap-1.5 text-small text-muted-foreground">
              <MapPin className="h-4 w-4" /> {activeLease.propertyAddress}, {activeLease.city},{' '}
              {activeLease.state} — Unit {activeLease.unitNumber}
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3 rounded-md border p-4">
                <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-caption text-muted-foreground">Lease Period</p>
                  <p className="text-small font-medium text-foreground">
                    {activeLease.startDate} → {activeLease.endDate}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-md border p-4">
                <Wallet className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-caption text-muted-foreground">Annual Rent</p>
                  <p className="text-small font-medium text-foreground">
                    {formatNaira(activeLease.monthlyRent)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-md border p-4">
                <FileSignature className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-caption text-muted-foreground">Security Deposit</p>
                  <p className="text-small font-medium text-foreground">
                    {formatNaira(activeLease.securityDeposit)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted p-3 text-small">
              <span className="text-muted-foreground">Lease Number</span>
              <span className="font-medium text-foreground">{activeLease.leaseNumber}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted p-3 text-small">
              <span className="text-muted-foreground">Billing Cycle</span>
              <span className="capitalize font-medium text-foreground">
                {activeLease.billingCycle}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-h5 text-foreground">No active lease</p>
            <p className="text-muted-foreground">
              You don&apos;t currently have an active lease. Contact your landlord if this seems
              incorrect.
            </p>
          </CardContent>
        </Card>
      )}

      {otherLeases.length > 0 && (
        <div>
          <h2 className="mb-3 text-h6 text-foreground">Lease History</h2>
          <div className="flex flex-col gap-3">
            {otherLeases.map((lease) => (
              <Card key={lease.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium text-foreground">{lease.propertyName}</p>
                    <p className="text-small text-muted-foreground">
                      Unit {lease.unitNumber} · {lease.startDate} → {lease.endDate}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {lease.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
