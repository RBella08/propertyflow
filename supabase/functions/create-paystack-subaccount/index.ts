import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { businessName, bankCode, bankName, accountNumber, accountName } = await req.json();
    if (!businessName || !bankCode || !accountNumber || !accountName) {
      throw new Error('Missing required fields');
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (profileError || !profile) throw new Error('Profile not found');

    const { data: landlord, error: landlordError } = await admin
      .from('landlords')
      .select('id, commission_percentage')
      .eq('profile_id', profile.id)
      .single();
    if (landlordError || !landlord) throw new Error('You are not registered as a landlord');

    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!;
    const percentageCharge = landlord.commission_percentage ?? 10;

    const paystackResponse = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: businessName,
        settlement_bank: bankCode,
        account_number: accountNumber,
        percentage_charge: percentageCharge,
      }),
    });

    const paystackData = await paystackResponse.json();
    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Failed to create Paystack subaccount');
    }

    const { error: updateError } = await admin
      .from('landlords')
      .update({
        bank_account_number: accountNumber,
        bank_code: bankCode,
        bank_name: bankName,
        account_name: accountName,
        subaccount_code: paystackData.data.subaccount_code,
      })
      .eq('id', landlord.id);
    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, subaccountCode: paystackData.data.subaccount_code }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
