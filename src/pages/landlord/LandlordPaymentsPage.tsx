import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRangeFilter } from '@/features/reports/components/DateRangeFilter';
import { ExportMenu } from '@/features/reports/components/ExportMenu';
import { usePaymentSummaryReport } from '@/features/reports/hooks/useReports';
import { useUpdatePaymentStatus } from '@/features/payments/hooks/usePaymentManagement';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDefaultStartDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}
function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  successful: 'success',
  pending: 'warning',
  processing: 'warning',
  failed: 'destructive',
  refunded: 'secondary',
};

const STATUS_FILTERS = ['all', 'successful', 'pending', 'failed', 'refunded'] as const;
const ALL_STATUSES = ['pending', 'processing', 'successful', 'failed', 'refunded'];

export function LandlordPaymentsPage() {
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const { data: payments, isLoading } = usePaymentSummaryReport(startDate, endDate);
  const updateStatus = useUpdatePaymentStatus();

  const filtered = payments?.filter((p) => statusFilter === 'all' || p.status === statusFilter);

  const handleChange = async (
    reference: string,
    status: 'pending' | 'processing' | 'successful' | 'failed' | 'refunded'
  ) => {
    try {
      await updateStatus.mutateAsync({ reference, status });
      toast.success(`Payment marked as "${status}"`);
    } catch {
      toast.error('Could not update payment status');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h4 text-foreground">Payments</h1>
          <p className="text-muted-foreground">
            Every payment received across your portfolio. You control the status here — mark offline
            confirmations as Successful, or process a Refund.
          </p>
        </div>
        <ExportMenu
          title="Payments"
          headers={['Reference', 'Tenant', 'Property', 'Amount (NGN)', 'Status', 'Paid At']}
          rows={(filtered ?? []).map((p) => [
            p.reference,
            p.tenantName,
            p.propertyName,
            p.amount,
            p.status,
            p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-',
          ])}
        />
      </div>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
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
            {status === 'all' ? 'All' : status}
          </Button>
        ))}
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
                  <p className="text-caption text-muted-foreground">
                    {p.propertyName} · {p.reference}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-small font-semibold text-foreground">
                    {formatNaira(p.amount)}
                  </span>
                  <Badge variant={statusVariant[p.status] ?? 'secondary'} className="capitalize">
                    {p.status}
                  </Badge>
                  <select
                    className="h-9 rounded-md border border-input bg-background px-2 text-small capitalize"
                    value={p.status}
                    onChange={(e) =>
                      handleChange(
                        p.reference,
                        e.target.value as
                          'pending' | 'processing' | 'successful' | 'failed' | 'refunded'
                      )
                    }
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
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
