import { supabase } from '@/lib/supabase';
import { sendEmailToProfile, notifyUser } from '@/lib/emailNotify';

function computeInvoiceStatus(balance: number, amount: number): 'pending' | 'paid' | 'partial' {
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
  newStatus: 'pending' | 'processing' | 'successful' | 'failed' | 'refunded'
): Promise<void> {
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id, status, amount, invoice_id, tenant_id, reference')
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

  if (wasSuccessful !== willBeSuccessful) {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, amount, balance')
      .eq('id', payment.invoice_id)
      .single();
    if (invoiceError) throw invoiceError;

    let newBalance: number;
    if (!wasSuccessful && willBeSuccessful) {
      newBalance = Math.max(0, invoice.balance - payment.amount);
    } else {
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

      try {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('profile_id')
          .eq('id', payment.tenant_id)
          .single();

        if (tenant) {
          await notifyUser(
            tenant.profile_id,
            'Payment confirmed',
            `Your payment of ₦${payment.amount.toLocaleString()} has been confirmed.`,
            'payment_success',
            '/tenant/payments'
          );
        }
      } catch (notifyError) {
        console.error('Failed to notify tenant of confirmed payment:', notifyError);
      }
    }
  }

  // Email on every status change, not just success
  try {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('profile_id')
      .eq('id', payment.tenant_id)
      .single();
    if (tenant) {
      const statusLabels: Record<string, string> = {
        pending: 'is now Pending',
        processing: 'is Processing',
        successful: 'was Confirmed',
        failed: 'Failed',
        refunded: 'was Refunded',
      };
      await sendEmailToProfile(
        tenant.profile_id,
        `Payment Update: ${payment.reference} — PropertyFlow`,
        `<p>Your payment (${payment.reference}) of ₦${payment.amount.toLocaleString()} ${statusLabels[newStatus] ?? `is now ${newStatus}`}.</p>`
      );
    }
  } catch (emailErr) {
    console.error('Payment status email failed:', emailErr);
  }
}
