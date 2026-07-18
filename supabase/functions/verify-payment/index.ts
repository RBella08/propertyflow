import { createClient } from '@supabase/supabase-js';
import { verifyPaystackTransaction, generateReceiptNumber } from '../_shared/paystack.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { reference } = await req.json();
    if (!reference) throw new Error('Missing payment reference');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Already processed? (e.g. webhook beat the frontend to it) — idempotent.
    const { data: existing } = await supabase
      .from('payments')
      .select('id, status')
      .eq('reference', reference)
      .maybeSingle();

    if (existing?.status === 'successful') {
      return new Response(JSON.stringify({ success: true, alreadyProcessed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const verification = await verifyPaystackTransaction(reference);
    if (!verification.status || verification.data.status !== 'success') {
      return new Response(JSON.stringify({ success: false, message: 'Payment not successful' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const invoiceId = verification.data.metadata.invoice_id;
    const tenantId = verification.data.metadata.tenant_id;
    if (!invoiceId || !tenantId) throw new Error('Missing invoice/tenant metadata on transaction');

    const amount = verification.data.amount / 100; // Paystack uses kobo

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .upsert(
        {
          invoice_id: invoiceId,
          tenant_id: tenantId,
          amount,
          gateway: 'paystack',
          reference,
          transaction_id: String(verification.data.id),
          currency: verification.data.currency,
          status: 'successful',
          paid_at: new Date().toISOString(),
        },
        { onConflict: 'reference' }
      )
      .select('id')
      .single();

    if (paymentError) throw paymentError;

    const { data: invoice, error: invoiceFetchError } = await supabase
      .from('invoices')
      .select('balance')
      .eq('id', invoiceId)
      .single();
    if (invoiceFetchError) throw invoiceFetchError;

    const newBalance = Math.max(0, invoice.balance - amount);
    const { error: invoiceUpdateError } = await supabase
      .from('invoices')
      .update({ balance: newBalance, status: newBalance === 0 ? 'paid' : 'partial' })
      .eq('id', invoiceId);
    if (invoiceUpdateError) throw invoiceUpdateError;

    const { error: receiptError } = await supabase.from('receipts').insert({
      payment_id: payment.id,
      receipt_number: generateReceiptNumber(),
      issued_at: new Date().toISOString(),
    });
    if (receiptError) console.error('Receipt generation failed:', receiptError.message);

    const { data: tenantProfile } = await supabase
      .from('tenants')
      .select(
        `
  profile_id,
  profiles:user_id_profiles!inner(user_id)
`
      )
      .eq('id', tenantId)
      .single();

    const profile = tenantProfile as {
      profiles: {
        user_id: string;
      }[];
    };

    const userId = profile.profiles[0]?.user_id;

    if (userId) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Payment successful',
        message: `Your payment of ₦${amount.toLocaleString()} was received successfully.`,
        type: 'payment',
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
