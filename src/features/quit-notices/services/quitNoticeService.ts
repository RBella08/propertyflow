import { supabase } from '@/lib/supabase';
import { notifyUser } from '@/lib/emailNotify';
import type { QuitNoticeFormInput } from '../schemas';

export interface QuitNoticeItem {
  id: string;
  reason: string;
  vacateBy: string;
  noticeText: string;
  createdAt: string;
  status: string;
  revokedAt: string | null;
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

  await notifyUser(
    tenantProfileId,
    'Notice to Quit received',
    noticeText,
    'lease_expiry',
    '/tenant/lease'
  );
}

export async function getQuitNoticesForLease(leaseId: string): Promise<QuitNoticeItem[]> {
  const { data, error } = await supabase
    .from('quit_notices')
    .select('id, reason, vacate_by, notice_text, created_at, status, revoked_at')
    .eq('lease_id', leaseId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((n) => ({
    id: n.id,
    reason: n.reason,
    vacateBy: n.vacate_by,
    noticeText: n.notice_text,
    createdAt: n.created_at,
    status: n.status,
    revokedAt: n.revoked_at,
  }));
}

export async function revokeQuitNotice(
  noticeId: string,
  tenantProfileId: string,
  propertyName: string
): Promise<void> {
  const { error } = await supabase
    .from('quit_notices')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', noticeId);
  if (error) throw error;

  await notifyUser(
    tenantProfileId,
    'Notice to Quit revoked',
    `Your landlord has revoked the previous Notice to Quit for ${propertyName}. You may disregard it.`,
    'lease_expiry',
    '/tenant/lease'
  );
}
