import { CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePaymentHistory } from '@/features/payments/hooks/usePayments';

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

const statusNote: Record<string, string> = {
  pending: 'Awaiting confirmation from your landlord.',
  processing: 'Your payment is being processed.',
  failed: 'This payment did not go through. Please try again from Pay Rent.',
  refunded: 'This payment has been refunded.',
};

export function PaymentsPage() {
  const { data: payments, isLoading } = usePaymentHistory();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Payment History</h1>
        <p className="text-muted-foreground">
          Every payment you&apos;ve made, and its current status.
        </p>
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : payments && payments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{p.reference}</p>
                  <p className="text-small capitalize text-muted-foreground">{p.gateway}</p>
                  {statusNote[p.status] && (
                    <p className="mt-1 text-caption text-muted-foreground">
                      {statusNote[p.status]}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold tabular-nums text-foreground">
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
        <div className="flex flex-col items-center gap-3 rounded-card border py-16 text-center">
          <CreditCard className="h-8 w-8 text-muted-foreground" />
          <p className="text-h5 text-foreground">No payments yet</p>
          <p className="text-muted-foreground">Your payment history will appear here.</p>
        </div>
      )}
    </div>
  );
}
