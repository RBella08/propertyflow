export async function sendPushFromEdge(
  profileId: string,
  title: string,
  body: string,
  url = '/'
): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ profileId, title, body, url }),
    });
  } catch (err) {
    console.error('Edge push failed:', err);
  }
}
