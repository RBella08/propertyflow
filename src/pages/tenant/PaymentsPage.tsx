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

export function PaymentsPage() {
  const { data: payments, isLoading } = usePaymentHistory();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h4 text-foreground">Payment History</h1>
      {isLoading ? (
        <Skeleton className="h-40" />
      ) : payments && payments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{p.reference}</p>
                  <p className="text-small capitalize text-muted-foreground">{p.gateway}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{formatNaira(p.amount)}</span>
                  <Badge variant={statusVariant[p.status] ?? 'secondary'} className="capitalize">
                    {p.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No payments yet.</p>
      )}
    </div>
  );
}
