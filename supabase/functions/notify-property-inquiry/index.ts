import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { propertyId, propertyName, visitorName, visitorEmail, visitorPhone, message, kind } =
      await req.json();

    if (!propertyId || !visitorName || !visitorEmail || !message) {
      throw new Error('Missing required fields');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('landlord_id')
      .eq('id', propertyId)
      .single();
    if (propertyError) throw propertyError;

    const { data: landlord, error: landlordError } = await supabase
      .from('landlords')
      .select('profile_id')
      .eq('id', property.landlord_id)
      .single();
    if (landlordError) throw landlordError;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', landlord.profile_id)
      .single();
    if (profileError) throw profileError;

    const title = kind === 'inspection' ? 'New inspection request' : 'New property inquiry';
    const notifMessage =
      kind === 'inspection'
        ? `${visitorName} requested to inspect "${propertyName}".`
        : `${visitorName} sent a message about "${propertyName}".`;

    await supabase.from('notifications').insert({
      user_id: landlord.profile_id,
      title,
      message: notifMessage,
      type: 'announcement',
    });

    await supabase.functions.invoke('send-email', {
      body: {
        to: profile.email,
        subject: `${title} — ${propertyName}`,
        html: `
          <h2>${title}</h2>
          <p><strong>From:</strong> ${visitorName} (${visitorEmail}${visitorPhone ? `, ${visitorPhone}` : ''})</p>
          <p><strong>Property:</strong> ${propertyName}</p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      },
    });

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
