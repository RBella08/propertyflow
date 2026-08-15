import { Download, Receipt as ReceiptIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useReceipts } from '@/features/payments/hooks/usePayments';
import { exportReceiptPDF } from '@/lib/export';

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
        <p className="text-muted-foreground">Download a PDF receipt for any completed payment.</p>
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : receipts && receipts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {receipts.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{r.receiptNumber}</p>
                  <p className="truncate text-small text-muted-foreground">
                    {r.propertyName} · Unit {r.unitNumber}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {new Date(r.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatNaira(r.amount)}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => exportReceiptPDF(r)}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-card border py-16 text-center">
          <ReceiptIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-h5 text-foreground">No receipts yet</p>
          <p className="text-muted-foreground">
            Receipts appear here automatically after a successful payment.
          </p>
        </div>
      )}
    </div>
  );
}
