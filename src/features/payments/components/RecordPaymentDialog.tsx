import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useTenantOutstandingInvoicesForLandlord,
  useRecordManualPayment,
} from '../hooks/useManualPayment';

interface RecordPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName: string;
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RecordPaymentDialog({
  open,
  onClose,
  tenantId,
  tenantName,
}: RecordPaymentDialogProps) {
  const { data: invoices, isLoading } = useTenantOutstandingInvoicesForLandlord(
    open ? tenantId : null
  );
  const recordPayment = useRecordManualPayment();

  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const selectedInvoice = invoices?.find((i) => i.id === invoiceId);

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const invoice = invoices?.find((i) => i.id === id);
    if (invoice) setAmount(String(invoice.balance));
  };

  const handleSubmit = async () => {
    if (!invoiceId || !amount || Number(amount) <= 0) {
      toast.error('Select an invoice and enter a valid amount');
      return;
    }
    try {
      await recordPayment.mutateAsync({
        invoiceId,
        tenantId,
        amount: Number(amount),
        note,
      });
      toast.success('Payment recorded as Pending', {
        description: "Confirm it from the Payments page once you've verified you received it.",
      });
      setInvoiceId('');
      setAmount('');
      setNote('');
      onClose();
    } catch (error) {
      toast.error('Could not record payment', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a cash or offline payment from {tenantName}. It saves as Pending — go to Payments
            afterward to confirm it once you&apos;ve verified you received it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="invoiceSelect">Outstanding Invoice</Label>
            <select
              id="invoiceSelect"
              value={invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select an invoice...</option>
              {(invoices ?? []).map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.billingPeriod} ({formatNaira(inv.balance)} due)
                </option>
              ))}
            </select>
            {invoices && invoices.length === 0 && !isLoading && (
              <p className="text-caption text-muted-foreground">
                No outstanding invoices for this tenant.
              </p>
            )}
          </div>

          {selectedInvoice && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount Received (₦)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={selectedInvoice.balance}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              rows={2}
              placeholder="e.g. Paid in cash at the office on..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={recordPayment.isPending}>
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
