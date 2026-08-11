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

export async function sendPushToProfile(
  profileId: string,
  title: string,
  body: string,
  url = '/notifications'
): Promise<void> {
  try {
    await supabase.functions.invoke('send-push', { body: { profileId, title, body, url } });
  } catch (err) {
    console.error('Push notification failed:', err);
  }
}

// Use this everywhere an in-app notification is created — it inserts the
// notification row AND sends a real push at the same time, in one call.
export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type:
    | 'rent_reminder'
    | 'payment_success'
    | 'payment_failed'
    | 'maintenance_update'
    | 'lease_expiry'
    | 'announcement'
    | 'welcome'
    | 'invoice_created'
    | 'lease_terminated',
  pushUrl = '/notifications'
): Promise<void> {
  try {
    await supabase.from('notifications').insert({ user_id: userId, title, message, type });
  } catch (err) {
    console.error('In-app notification failed:', err);
  }
  await sendPushToProfile(userId, title, message, pushUrl);
}
