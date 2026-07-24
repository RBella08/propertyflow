import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExportMenu } from '@/features/reports/components/ExportMenu';
import { useAdminAllPayments } from '@/features/admin/hooks/useAdminOversight';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  successful: 'success',
  pending: 'warning',
  processing: 'warning',
  failed: 'destructive',
  refunded: 'secondary',
};

const STATUS_FILTERS = [
  'all',
  'successful',
  'pending',
  'processing',
  'failed',
  'refunded',
] as const;

export function AdminPaymentsPage() {
  const { data: payments, isLoading } = useAdminAllPayments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');

  const filtered = payments?.filter((p) => {
    const matchesSearch =
      p.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h4 text-foreground">All Payments</h1>
          <p className="text-muted-foreground">
            Every payment processed across the platform. Only &quot;Successful&quot; payments count
            toward revenue — marking one &quot;Refunded&quot; removes it automatically.
          </p>
        </div>
        <ExportMenu
          title="All Payments"
          headers={['Reference', 'Tenant', 'Amount (NGN)', 'Gateway', 'Status', 'Paid At']}
          rows={(filtered ?? []).map((p) => [
            p.reference,
            p.tenantName,
            p.amount,
            p.gateway,
            p.status,
            p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-',
          ])}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by tenant or reference..."
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
          {filtered.map((p) => (
            <Card key={p.reference}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="text-small font-medium text-foreground">{p.tenantName}</p>
                  <p className="text-caption capitalize text-muted-foreground">
                    {p.gateway} · {p.reference}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-small font-semibold text-foreground">
                    {formatNaira(p.amount)}
                  </span>
                  <Badge variant={statusVariant[p.status] ?? 'secondary'} className="capitalize">
                    {p.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No payments match your filters.</p>
      )}
    </div>
  );
}
