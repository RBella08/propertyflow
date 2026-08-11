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

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: callerProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!callerProfile || !['admin', 'super_admin'].includes(callerProfile.role)) {
      throw new Error('Only admins can delete accounts');
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) throw new Error('Missing targetUserId');

    const { data: targetProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('user_id', targetUserId)
      .single();

    // Storage cleanup — files tagged to this user in our own buckets.
    if (targetProfile) {
      const buckets = ['avatars', 'id-documents'];
      for (const bucket of buckets) {
        try {
          const { data: files } = await admin.storage.from(bucket).list(targetProfile.id);
          if (files && files.length > 0) {
            const paths = files.map((f) => `${targetProfile.id}/${f.name}`);
            await admin.storage.from(bucket).remove(paths);
          }
        } catch (storageError) {
          console.error(`Storage cleanup failed for bucket ${bucket}:`, storageError);
        }
      }
    }

    // Pre-clean internal Supabase auth-schema rows that GoTrue's own
    // deleteUser() sometimes fails to clean up itself, causing the
    // generic "Database error deleting user" response. This is the
    // documented workaround for that specific GoTrue behavior.
    const authTables = ['identities', 'sessions', 'mfa_factors', 'one_time_tokens'];
    for (const table of authTables) {
      try {
        await admin.schema('auth').from(table).delete().eq('user_id', targetUserId);
      } catch (cleanupError) {
        console.error(`Auth cleanup failed for auth.${table}:`, cleanupError);
      }
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      throw new Error(
        `Still could not delete: ${deleteError.message}. If this persists, check Supabase Dashboard → Logs → Postgres Logs at this exact timestamp for the real underlying error, since Supabase hides the detailed reason from this API response.`
      );
    }

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
