import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminAllLeases } from '@/features/admin/hooks/useAdminOversight';
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_FILTERS = ['all', 'active', 'terminated', 'expired', 'renewed'] as const;

export function AdminLeasesPage() {
  const { data: leases, isLoading } = useAdminAllLeases();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');

  const filtered = leases?.filter((l) => {
    const matchesSearch =
      l.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      l.propertyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">All Leases</h1>
        <p className="text-muted-foreground">Every lease agreement across the platform.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by tenant or property..."
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
              {status}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((l) => (
            <Card key={l.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">
                    {l.leaseNumber} — {l.tenantName}
                  </p>
                  <p className="text-small text-muted-foreground">
                    {l.propertyName} · Unit {l.unitNumber} · {formatNaira(l.monthlyRent)}/yr
                  </p>
                </div>
                <LeaseStatusBadge status={l.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No leases match your filters.</p>
      )}
    </div>
  );
}
