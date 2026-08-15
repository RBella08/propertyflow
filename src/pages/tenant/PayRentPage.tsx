import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOutstandingInvoices } from '@/features/payments/hooks/usePayments';
import {
  getTenantId,
  verifyPaymentServerSide,
  getInvoiceSubaccountCode,
} from '@/features/payments/services/paymentService';
import { openPaystackCheckout } from '@/lib/paystack';
import { useAuthContext } from '@/providers/AuthProvider';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PayRentPage() {
  const { profile } = useAuthContext();
  const { data: invoices, isLoading } = useOutstandingInvoices();
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const queryClient = useQueryClient();

  const handlePay = async (invoiceId: string, balance: number) => {
    if (!profile) return;
    setPayingInvoiceId(invoiceId);
    try {
      const tenantId = await getTenantId(profile.id);
      const subaccountCode = await getInvoiceSubaccountCode(invoiceId);
      await openPaystackCheckout({
        email: profile.email,
        amountNaira: balance,
        metadata: { invoice_id: invoiceId, tenant_id: tenantId },
        subaccountCode,
        onSuccess: async (reference) => {
          setVerifying(true);
          try {
            const result = await verifyPaymentServerSide(reference);
            if (result.success) {
              toast.success('Payment successful!', {
                description: 'Your invoice has been updated.',
              });
              queryClient.invalidateQueries({ queryKey: ['outstanding-invoices'] });
              queryClient.invalidateQueries({ queryKey: ['payment-history'] });
              queryClient.invalidateQueries({ queryKey: ['tenant-dashboard'] });
            } else {
              toast.error('Payment could not be verified', { description: result.message });
            }
          } finally {
            setVerifying(false);
            setPayingInvoiceId(null);
          }
        },
        onClose: () => setPayingInvoiceId(null),
      });
    } catch (error) {
      toast.error('Could not start payment', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
      setPayingInvoiceId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Pay Rent</h1>
        <p className="text-muted-foreground">
          Settle your outstanding invoices securely via Paystack.
        </p>
      </div>

      {verifying && (
        <div className="flex items-center gap-2 rounded-md border bg-accent p-4 text-small">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> Verifying your payment, please
          wait...
        </div>
      )}

      {invoices && invoices.length > 0 ? (
        <div className="flex flex-col gap-3">
          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{invoice.invoiceNumber}</p>
                  <p className="text-small text-muted-foreground">
                    {invoice.billingPeriod} · Due {invoice.dueDate}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-h6 font-semibold tabular-nums text-primary">
                    {formatNaira(invoice.balance)}
                  </span>
                  <Button
                    loading={payingInvoiceId === invoice.id}
                    disabled={verifying}
                    onClick={() => handlePay(invoice.id, invoice.balance)}
                  >
                    Pay Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-card border py-16 text-center">
          <Wallet className="h-8 w-8 text-muted-foreground" />
          <p className="text-h5 text-foreground">You&apos;re all caught up!</p>
          <p className="text-muted-foreground">No outstanding invoices right now.</p>
        </div>
      )}
    </div>
  );
}
