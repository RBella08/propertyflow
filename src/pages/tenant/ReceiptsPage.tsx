import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useReceipts } from '@/features/payments/hooks/usePayments';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ReceiptsPage() {
  const { data: receipts, isLoading } = useReceipts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Receipts</h1>
        {/* PDF download is a dedicated follow-up feature (FEATURES.md #12) */}
        <p className="text-muted-foreground">
          PDF download is coming in a dedicated follow-up step.
        </p>
      </div>
      {isLoading ? (
        <Skeleton className="h-40" />
      ) : receipts && receipts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {receipts.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{r.receiptNumber}</p>
                  <p className="text-small text-muted-foreground">
                    {new Date(r.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{formatNaira(r.amount)}</span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No receipts yet.</p>
      )}
    </div>
  );
}
