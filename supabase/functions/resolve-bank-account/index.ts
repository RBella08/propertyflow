const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { accountNumber, bankCode } = await req.json();
    if (!accountNumber || !bankCode) throw new Error('Missing account number or bank code');

    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!;
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const data = await response.json();

    if (!data.status) throw new Error(data.message || 'Could not resolve account');

    return new Response(JSON.stringify({ success: true, accountName: data.data.account_name }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
