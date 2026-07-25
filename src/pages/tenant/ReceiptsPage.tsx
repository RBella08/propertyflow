import { Download } from 'lucide-react';
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
        <Skeleton className="h-40" />
      ) : receipts && receipts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {receipts.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{r.receiptNumber}</p>
                  <p className="text-small text-muted-foreground">
                    {r.propertyName} · Unit {r.unitNumber}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {new Date(r.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{formatNaira(r.amount)}</span>
                  <Button size="sm" variant="outline" onClick={() => exportReceiptPDF(r)}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                  </Button>
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
