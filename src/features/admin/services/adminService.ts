import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/auth';

export interface AdminUserItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: string;
  isVerified: boolean;
  createdAt: string;
}

export async function getAllUsers(): Promise<AdminUserItem[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, email, role, status, is_verified, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((u) => ({
    id: u.id,
    userId: u.user_id,
    fullName: u.full_name ?? u.email,
    email: u.email,
    role: u.role,
    status: u.status ?? 'inactive',
    isVerified: u.is_verified,
    createdAt: u.created_at ?? '',
  }));
}

export async function updateUserStatus(
  userId: string,
  status: 'active' | 'suspended'
): Promise<void> {
  const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
  if (error) throw error;
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) throw error;
}

export async function toggleUserVerification(userId: string, isVerified: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_verified: isVerified })
    .eq('id', userId);

  if (error) throw error;
}

export async function deleteUserAccount(authUserId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    body: { targetUserId: authUserId },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.message);
}

export interface AuditLogItem {
  id: string;
  userEmail: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  createdAt: string;
}

export async function getAuditLogs(limit = 100): Promise<AuditLogItem[]> {
  // Fetched in two steps rather than a nested select: audit_logs.user_id
  // references auth.users (per the Step 13 fix), which PostgREST has no
  // known foreign key to profiles for — so embedding won't auto-resolve.
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('id, user_id, action, resource, resource_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  const userIds = Array.from(
    new Set((logs ?? []).map((l) => l.user_id).filter((id): id is string => id !== null))
  );

  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('user_id, email').in('user_id', userIds)
    : { data: [] as { user_id: string; email: string }[] };

  const emailMap = new Map((profiles ?? []).map((p) => [p.user_id, p.email]));

  return (logs ?? []).map((row) => ({
    id: row.id,
    userEmail: row.user_id ? (emailMap.get(row.user_id) ?? null) : null,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id,
    createdAt: row.created_at ?? '',
  }));
}
