import { Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecentPayment } from '../services/tenantDashboardService';

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

interface RecentPaymentsTableProps {
  payments: RecentPayment[];
}

export function RecentPaymentsTable({ payments }: RecentPaymentsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h6">Recent Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Wallet className="h-8 w-8 text-muted-foreground" />
            <p className="text-small text-muted-foreground">No payments yet.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-small font-medium text-foreground">
                    {payment.reference}
                  </p>
                  <p className="text-caption capitalize text-muted-foreground">{payment.gateway}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-small font-semibold tabular-nums text-foreground">
                    {formatNaira(payment.amount)}
                  </span>
                  <Badge
                    variant={statusVariant[payment.status ?? ''] ?? 'secondary'}
                    className="capitalize"
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
