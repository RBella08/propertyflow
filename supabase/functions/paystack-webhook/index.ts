import { createClient } from '@supabase/supabase-js';
import { verifyPaystackTransaction, generateReceiptNumber } from '../_shared/paystack.ts';

Deno.serve(async (req) => {
  const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!;
  const signature = req.headers.get('x-paystack-signature');
  const rawBody = await req.text();

  // Verify the request genuinely came from Paystack, not a spoofed caller.
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (computedSignature !== signature) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'charge.success') {
    const reference = event.data.reference;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: existing } = await supabase
      .from('payments')
      .select('id, status')
      .eq('reference', reference)
      .maybeSingle();

    if (existing?.status === 'successful') {
      return new Response('Already processed', { status: 200 });
    }

    const verification = await verifyPaystackTransaction(reference);
    if (!verification.status || verification.data.status !== 'success') {
      return new Response('Verification failed', { status: 400 });
    }

    const invoiceId = verification.data.metadata.invoice_id;
    const tenantId = verification.data.metadata.tenant_id;
    const amount = verification.data.amount / 100;

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

    if (!paymentError && payment) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('balance')
        .eq('id', invoiceId)
        .single();
      if (invoice) {
        const newBalance = Math.max(0, invoice.balance - amount);
        await supabase
          .from('invoices')
          .update({ balance: newBalance, status: newBalance === 0 ? 'paid' : 'partial' })
          .eq('id', invoiceId);
      }
      await supabase.from('receipts').insert({
        payment_id: payment.id,
        receipt_number: generateReceiptNumber(),
        issued_at: new Date().toISOString(),
      });
    }
  }

  return new Response('OK', { status: 200 });
});
