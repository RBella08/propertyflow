import { supabase } from './supabase';

export async function sendEmailToProfile(
  profileId: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', profileId)
      .single();
    if (!profile?.email) return;
    await supabase.functions.invoke('send-email', { body: { to: profile.email, subject, html } });
  } catch (err) {
    console.error('Email notification failed:', err);
  }
}
