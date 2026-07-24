const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!;
    const response = await fetch('https://api.paystack.co/bank?currency=NGN', {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = await response.json();

    return new Response(JSON.stringify({ success: true, banks: data.data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
