import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  senderProfileId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface ChatConversation {
  leaseId: string;
  otherPersonProfileId: string;
  otherPersonName: string;
  otherPersonRole: string;
  propertyName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export async function getMessagesForConversation(
  leaseId: string,
  myProfileId: string,
  counterpartProfileId: string
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('id, sender_profile_id, body, created_at, read_at')
    .eq('lease_id', leaseId)
    .or(
      `and(sender_profile_id.eq.${myProfileId},recipient_profile_id.eq.${counterpartProfileId}),and(sender_profile_id.eq.${counterpartProfileId},recipient_profile_id.eq.${myProfileId})`
    )
    .order('created_at', { ascending: true });
  if (error) throw error;

  return (data ?? []).map((m) => ({
    id: m.id,
    senderProfileId: m.sender_profile_id,
    body: m.body,
    createdAt: m.created_at,
    readAt: m.read_at,
  }));
}

export async function sendMessage(
  leaseId: string,
  senderProfileId: string,
  recipientProfileId: string,
  body: string
): Promise<void> {
  const { error } = await supabase.from('direct_messages').insert({
    lease_id: leaseId,
    sender_profile_id: senderProfileId,
    recipient_profile_id: recipientProfileId,
    body,
  });
  if (error) throw error;

  await supabase.from('notifications').insert({
    user_id: recipientProfileId,
    title: 'New message',
    message: body.length > 100 ? `${body.slice(0, 100)}...` : body,
    type: 'announcement',
  });
}

export async function markMessagesRead(
  leaseId: string,
  myProfileId: string,
  counterpartProfileId: string
): Promise<void> {
  await supabase
    .from('direct_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('lease_id', leaseId)
    .eq('recipient_profile_id', myProfileId)
    .eq('sender_profile_id', counterpartProfileId)
    .is('read_at', null);
}

async function buildConversation(
  leaseId: string,
  counterpartProfileId: string,
  myProfileId: string,
  propertyName: string,
  roleLabel: string
): Promise<ChatConversation> {
  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', counterpartProfileId)
    .maybeSingle();

  const { data: messages } = await supabase
    .from('direct_messages')
    .select('body, created_at')
    .eq('lease_id', leaseId)
    .or(
      `and(sender_profile_id.eq.${myProfileId},recipient_profile_id.eq.${counterpartProfileId}),and(sender_profile_id.eq.${counterpartProfileId},recipient_profile_id.eq.${myProfileId})`
    )
    .order('created_at', { ascending: false })
    .limit(1);

  const { count } = await supabase
    .from('direct_messages')
    .select('id', { count: 'exact', head: true })
    .eq('lease_id', leaseId)
    .eq('recipient_profile_id', myProfileId)
    .eq('sender_profile_id', counterpartProfileId)
    .is('read_at', null);

  return {
    leaseId,
    otherPersonProfileId: counterpartProfileId,
    otherPersonName: otherProfile?.full_name ?? otherProfile?.email ?? roleLabel,
    otherPersonRole: roleLabel,
    propertyName,
    lastMessage: messages?.[0]?.body ?? null,
    lastMessageAt: messages?.[0]?.created_at ?? null,
    unreadCount: count ?? 0,
  };
}

// Tenant side: one conversation PER counterpart (Landlord, and Manager if assigned)
export async function getTenantConversations(
  tenantId: string,
  myProfileId: string
): Promise<ChatConversation[]> {
  const { data: lease } = await supabase
    .from('leases')
    .select('id, unit_id')
    .eq('tenant_id', tenantId)
    .in('status', ['active', 'renewed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lease) return [];

  const { data: unit } = await supabase
    .from('units')
    .select('property_id')
    .eq('id', lease.unit_id)
    .single();
  const { data: property } = await supabase
    .from('properties')
    .select('property_name, landlord_id, manager_id')
    .eq('id', unit!.property_id)
    .single();

  const conversations: ChatConversation[] = [];

  const { data: landlord } = await supabase
    .from('landlord_basic_info')
    .select('profile_id')
    .eq('id', property!.landlord_id)
    .single();

  if (landlord?.profile_id) {
    conversations.push(
      await buildConversation(
        lease.id,
        landlord.profile_id,
        myProfileId,
        property!.property_name,
        'Landlord'
      )
    );
  }

  if (property!.manager_id) {
    conversations.push(
      await buildConversation(
        lease.id,
        property!.manager_id,
        myProfileId,
        property!.property_name,
        'Estate Manager'
      )
    );
  }

  return conversations;
}

async function buildConversationsForProperties(
  properties: { id: string; property_name: string }[],
  myProfileId: string
): Promise<ChatConversation[]> {
  const propertyIds = properties.map((p) => p.id);
  const propertyNameMap = new Map(properties.map((p) => [p.id, p.property_name]));
  if (propertyIds.length === 0) return [];

  const { data: units } = await supabase
    .from('units')
    .select('id, property_id')
    .in('property_id', propertyIds);
  const unitIds = (units ?? []).map((u) => u.id);
  const unitPropertyMap = new Map((units ?? []).map((u) => [u.id, u.property_id]));
  if (unitIds.length === 0) return [];

  const { data: leases } = await supabase
    .from('leases')
    .select('id, unit_id, tenant_id')
    .in('unit_id', unitIds)
    .in('status', ['active', 'renewed']);
  if (!leases || leases.length === 0) return [];

  const tenantIds = leases.map((l) => l.tenant_id);
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, profiles!inner(id, full_name, email)')
    .in('id', tenantIds);
  const tenantProfileMap = new Map((tenants ?? []).map((t: any) => [t.id, t.profiles]));

  const results: ChatConversation[] = [];

  for (const lease of leases) {
    const tenantProfile = tenantProfileMap.get(lease.tenant_id);
    if (!tenantProfile) continue;

    const conv = await buildConversation(
      lease.id,
      tenantProfile.id,
      myProfileId,
      propertyNameMap.get(unitPropertyMap.get(lease.unit_id) ?? '') ?? 'Unknown',
      'Tenant'
    );
    results.push(conv);
  }

  return results.sort((a, b) => (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? ''));
}

export async function getLandlordConversations(profileId: string): Promise<ChatConversation[]> {
  const { data: landlordRow } = await supabase
    .from('landlords')
    .select('id')
    .eq('profile_id', profileId)
    .single();
  if (!landlordRow) return [];
  const { data: properties } = await supabase
    .from('properties')
    .select('id, property_name')
    .eq('landlord_id', landlordRow.id);
  return buildConversationsForProperties(properties ?? [], profileId);
}

export async function getManagerConversations(profileId: string): Promise<ChatConversation[]> {
  const { data: properties } = await supabase
    .from('properties')
    .select('id, property_name')
    .eq('manager_id', profileId);
  return buildConversationsForProperties(properties ?? [], profileId);
}
