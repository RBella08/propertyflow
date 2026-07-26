import { supabase } from '@/lib/supabase';
import type { QuitNoticeFormInput } from '../schemas';

export interface QuitNoticeItem {
  id: string;
  reason: string;
  vacateBy: string;
  noticeText: string;
  createdAt: string;
}

export async function serveQuitNotice(
  leaseId: string,
  issuerProfileId: string,
  tenantProfileId: string,
  propertyName: string,
  input: QuitNoticeFormInput
): Promise<void> {
  const noticeText = `You are hereby given notice to vacate the premises at ${propertyName} by ${input.vacateBy}. Reason: ${input.reason}`;

  const { error } = await supabase.from('quit_notices').insert({
    lease_id: leaseId,
    issued_by_profile_id: issuerProfileId,
    reason: input.reason,
    vacate_by: input.vacateBy,
    notice_text: noticeText,
  });
  if (error) throw error;

  await supabase.from('notifications').insert({
    user_id: tenantProfileId,
    title: 'Notice to Quit received',
    message: noticeText,
    type: 'lease_expiry',
  });
}

export async function getQuitNoticesForLease(leaseId: string): Promise<QuitNoticeItem[]> {
  const { data, error } = await supabase
    .from('quit_notices')
    .select('id, reason, vacate_by, notice_text, created_at')
    .eq('lease_id', leaseId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((n) => ({
    id: n.id,
    reason: n.reason,
    vacateBy: n.vacate_by,
    noticeText: n.notice_text,
    createdAt: n.created_at,
  }));
}
