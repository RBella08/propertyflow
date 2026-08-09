import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { reference } = await req.json();
    if (!reference) throw new Error('Missing reference');

    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!;
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return new Response(JSON.stringify({ success: false, message: 'Payment not successful' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { landlord_profile_id, plan_id } = verifyData.data.metadata;
    const amount = verifyData.data.amount / 100;

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await admin
      .from('plan_payments')
      .upsert(
        { landlord_profile_id, plan_id, reference, amount, status: 'successful' },
        { onConflict: 'reference' }
      );

    const { data: plan } = await admin
      .from('subscription_plans')
      .select('duration_months')
      .eq('id', plan_id)
      .single();

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (plan?.duration_months ?? 1));

    await admin
      .from('landlords')
      .update({ plan_id, plan_expires_at: expiresAt.toISOString() })
      .eq('profile_id', landlord_profile_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: (error as Error).message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
