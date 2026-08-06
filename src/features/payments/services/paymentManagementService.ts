import { supabase } from '@/lib/supabase';
import { sendEmailToProfile } from '@/lib/emailNotify';
import type { Database } from '@/types/database';

type PaymentStatus = Database['public']['Enums']['payment_status'];

type InvoiceStatus = Database['public']['Enums']['invoice_status'];

function computeInvoiceStatus(balance: number, amount: number): InvoiceStatus {
  if (balance <= 0) return 'paid';
  if (balance >= amount) return 'pending';
  return 'partial';
}

function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RCT-${year}-${random}`;
}

export async function updatePaymentStatus(
  reference: string,
  newStatus: PaymentStatus
): Promise<void> {
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id, status, amount, invoice_id')
    .eq('reference', reference)
    .single();
  if (paymentError) throw paymentError;

  const wasSuccessful = payment.status === 'successful';
  const willBeSuccessful = newStatus === 'successful';

  const { error: updateError } = await supabase
    .from('payments')
    .update({ status: newStatus, paid_at: willBeSuccessful ? new Date().toISOString() : null })
    .eq('reference', reference);
  if (updateError) throw updateError;

  // No transition between "counts as paid" and "doesn't count as paid" —
  // nothing more to reconcile (e.g. pending -> processing).
  if (wasSuccessful === willBeSuccessful) return;

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, amount, balance')
    .eq('id', payment.invoice_id)
    .single();
  if (invoiceError) throw invoiceError;

  let newBalance: number;
  if (!wasSuccessful && willBeSuccessful) {
    // Newly confirmed — reduce what's owed
    newBalance = Math.max(0, invoice.balance - payment.amount);
  } else {
    // Reversed (refunded / marked failed after being successful) — restore what's owed
    newBalance = Math.min(invoice.amount, invoice.balance + payment.amount);
  }

  const { error: invoiceUpdateError } = await supabase
    .from('invoices')
    .update({ balance: newBalance, status: computeInvoiceStatus(newBalance, invoice.amount) })
    .eq('id', invoice.id);
  if (invoiceUpdateError) throw invoiceUpdateError;

  if (!wasSuccessful && willBeSuccessful) {
    const { data: existingReceipt } = await supabase
      .from('receipts')
      .select('id')
      .eq('payment_id', payment.id)
      .maybeSingle();

    if (!existingReceipt) {
      await supabase.from('receipts').insert({
        payment_id: payment.id,
        receipt_number: generateReceiptNumber(),
        issued_at: new Date().toISOString(),
      });
    }

    // Notify the tenant, matching the online-payment experience
    try {
      const { data: paymentRow } = await supabase
        .from('payments')
        .select('tenant_id')
        .eq('id', payment.id)
        .single();

      if (paymentRow) {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('profile_id')
          .eq('id', paymentRow.tenant_id)
          .single();

        if (tenant) {
          await supabase.from('notifications').insert({
            user_id: tenant.profile_id,
            title: 'Payment confirmed',
            message: `Your payment of ₦${payment.amount.toLocaleString()} has been confirmed.`,
            type: 'payment_success',
          });

          sendEmailToProfile(
            tenant.profile_id,
            'Payment Confirmed — PropertyFlow',
            `<p>Your payment of ₦${payment.amount.toLocaleString()} has been confirmed.</p>`
          );
        }
      }
    } catch (notifyError) {
      console.error('Failed to notify tenant of confirmed payment:', notifyError);
    }
  }
}
