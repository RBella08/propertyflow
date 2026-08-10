import { supabase } from '@/lib/supabase';
import type { AnnouncementFormInput } from '../schemas';

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  propertyName?: string;
}

export async function createAnnouncement(
  propertyId: string,
  authorProfileId: string,
  input: AnnouncementFormInput
): Promise<void> {
  const { error } = await supabase.from('announcements').insert({
    property_id: propertyId,
    author_profile_id: authorProfileId,
    title: input.title,
    body: input.body,
  });
  if (error) throw error;

  try {
    const { data: units } = await supabase.from('units').select('id').eq('property_id', propertyId);
    const unitIds = (units ?? []).map((u) => u.id);
    if (unitIds.length === 0) return;

    const { data: leases } = await supabase
      .from('leases')
      .select('tenant_id')
      .in('unit_id', unitIds)
      .in('status', ['active', 'renewed']);
    const tenantIds = Array.from(new Set((leases ?? []).map((l) => l.tenant_id)));
    if (tenantIds.length === 0) return;

    const { data: tenants } = await supabase
      .from('tenants')
      .select('profile_id')
      .in('id', tenantIds);

    if (tenants && tenants.length > 0) {
      await supabase.from('notifications').insert(
        tenants.map((t) => ({
          user_id: t.profile_id,
          title: `New announcement: ${input.title}`,
          message: input.body,
          type: 'announcement' as const,
        }))
      );
    }
  } catch (notifyError) {
    console.error('Failed to notify tenants of announcement:', notifyError);
  }
}

export async function getPropertyAnnouncements(propertyId: string): Promise<AnnouncementItem[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, body, created_at')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    createdAt: a.created_at,
  }));
}

export async function getTenantAnnouncements(tenantId: string): Promise<AnnouncementItem[]> {
  const { data: leases } = await supabase
    .from('leases')
    .select('unit_id')
    .eq('tenant_id', tenantId)
    .eq('status', 'active');
  const unitIds = (leases ?? []).map((l) => l.unit_id);
  if (unitIds.length === 0) return [];

  const { data: units } = await supabase.from('units').select('id, property_id').in('id', unitIds);
  const propertyIds = Array.from(new Set((units ?? []).map((u) => u.property_id)));
  if (propertyIds.length === 0) return [];

  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, body, created_at, properties!inner(property_name)')
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((a: any) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    createdAt: a.created_at,
    propertyName: a.properties.property_name,
  }));
}
