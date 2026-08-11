import { createClient } from 'jsr:@supabase/supabase-js@2';
import { verifyPaystackTransaction, generateReceiptNumber } from '../_shared/paystack.ts';
import { sendPushFromEdge } from '../_shared/notify.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();
    if (!reference) throw new Error('Missing payment reference');

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
      .update({
        balance: newBalance,
        status: newBalance === 0 ? 'paid' : 'partial',
      })
      .eq('id', invoiceId);

    if (invoiceUpdateError) throw invoiceUpdateError;

    const { error: receiptError } = await supabase.from('receipts').insert({
      payment_id: payment.id,
      receipt_number: generateReceiptNumber(),
      issued_at: new Date().toISOString(),
    });

    if (receiptError) console.error('Receipt generation failed:', receiptError.message);

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('profile_id')
      .eq('id', tenantId)
      .single();

    if (tenantError) throw tenantError;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', tenant.profile_id)
      .single();

    if (profileError) throw profileError;

    const tenantTitle = 'Payment successful';
    const tenantMessage = `Your payment of ₦${amount.toLocaleString()} was received successfully.`;

    await supabase.from('notifications').insert({
      user_id: tenant.profile_id,
      title: tenantTitle,
      message: tenantMessage,
      type: 'payment_success',
    });
    await sendPushFromEdge(tenant.profile_id, tenantTitle, tenantMessage, '/tenant/payments');

    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: profile.email,
          subject: 'Payment Received — PropertyFlow',
          html: `
            <h2>Payment Received</h2>
            <p>Hello,</p>
            <p>We've received your payment of <strong>₦${amount.toLocaleString()}</strong>.</p>
            <p>Thank you for your payment.</p>
          `,
        },
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    try {
      const { data: invoiceRow } = await supabase
        .from('invoices')
        .select('lease_id')
        .eq('id', invoiceId)
        .single();
      const { data: leaseRow } = await supabase
        .from('leases')
        .select('unit_id')
        .eq('id', invoiceRow!.lease_id)
        .single();
      const { data: unitRow } = await supabase
        .from('units')
        .select('property_id')
        .eq('id', leaseRow!.unit_id)
        .single();
      const { data: propertyRow } = await supabase
        .from('properties')
        .select('landlord_id, manager_id, property_name')
        .eq('id', unitRow!.property_id)
        .single();

      let recipientProfileId: string | null = propertyRow!.manager_id;
      if (!recipientProfileId) {
        const { data: landlordRow } = await supabase
          .from('landlords')
          .select('profile_id')
          .eq('id', propertyRow!.landlord_id)
          .single();
        recipientProfileId = landlordRow?.profile_id ?? null;
      }

      if (recipientProfileId) {
        const { data: recipientProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', recipientProfileId)
          .single();

        const landlordTitle = 'Rent payment received';
        const landlordMessage = `A payment of ₦${amount.toLocaleString()} was received for ${propertyRow!.property_name}.`;

        await supabase.from('notifications').insert({
          user_id: recipientProfileId,
          title: landlordTitle,
          message: landlordMessage,
          type: 'payment_success',
        });
        await sendPushFromEdge(
          recipientProfileId,
          landlordTitle,
          landlordMessage,
          '/landlord/payments'
        );

        if (recipientProfile?.email) {
          await supabase.functions.invoke('send-email', {
            body: {
              to: recipientProfile.email,
              subject: 'Rent Payment Received — PropertyFlow',
              html: `<p>A payment of <strong>₦${amount.toLocaleString()}</strong> was received for ${propertyRow!.property_name}.</p>`,
            },
          });
        }
      }
    } catch (landlordNotifyError) {
      console.error('Landlord payment notification failed:', landlordNotifyError);
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
