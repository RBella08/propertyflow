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
  otherPersonName: string;
  otherPersonProfileId: string;
  propertyName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export async function getMessagesForLease(leaseId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('id, sender_profile_id, body, created_at, read_at')
    .eq('lease_id', leaseId)
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

export async function markMessagesRead(leaseId: string, myProfileId: string): Promise<void> {
  await supabase
    .from('direct_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('lease_id', leaseId)
    .eq('recipient_profile_id', myProfileId)
    .is('read_at', null);
}

export async function getTenantConversation(
  tenantId: string,
  myProfileId: string
): Promise<ChatConversation | null> {
  const { data: lease } = await supabase
    .from('leases')
    .select('id, unit_id')
    .eq('tenant_id', tenantId)
    .in('status', ['active', 'renewed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lease) return null;

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

  let otherPersonProfileId: string;
  if (property!.manager_id) {
    otherPersonProfileId = property!.manager_id;
  } else {
    const { data: landlord, error: landlordError } = await supabase
      .from('landlord_basic_info')
      .select('profile_id')
      .eq('id', property!.landlord_id)
      .single();

    if (landlordError) throw landlordError;

    if (!landlord?.profile_id) {
      throw new Error('Landlord profile ID is missing.');
    }
    otherPersonProfileId = landlord.profile_id;
  }

  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', otherPersonProfileId)
    .maybeSingle();

  const { data: messages } = await supabase
    .from('direct_messages')
    .select('body, created_at, recipient_profile_id, read_at')
    .eq('lease_id', lease.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const unreadCount = await supabase
    .from('direct_messages')
    .select('id', { count: 'exact', head: true })
    .eq('lease_id', lease.id)
    .eq('recipient_profile_id', myProfileId)
    .is('read_at', null);

  return {
    leaseId: lease.id,
    otherPersonName: otherProfile?.full_name ?? otherProfile?.email ?? 'Landlord',
    otherPersonProfileId: otherPersonProfileId,
    propertyName: property!.property_name,
    lastMessage: messages?.[0]?.body ?? null,
    lastMessageAt: messages?.[0]?.created_at ?? null,
    unreadCount: unreadCount.count ?? 0,
  };
}

export async function getLandlordConversations(profileId: string): Promise<ChatConversation[]> {
  const { data: landlord, error: landlordError } = await supabase
    .from('landlords')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  if (landlordError) throw landlordError;

  if (!landlord?.id) {
    throw new Error('Landlord not found.');
  }

  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('id, property_name')
    .eq('landlord_id', landlord.id);

  if (propertiesError) throw propertiesError;

  return buildConversationsForProperties(properties ?? [], profileId);
}

export async function getManagerConversations(profileId: string): Promise<ChatConversation[]> {
  const { data: properties } = await supabase
    .from('properties')
    .select('id, property_name')
    .eq('manager_id', profileId);
  return buildConversationsForProperties(properties ?? [], profileId);
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

    const { data: messages } = await supabase
      .from('direct_messages')
      .select('body, created_at')
      .eq('lease_id', lease.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const { count } = await supabase
      .from('direct_messages')
      .select('id', { count: 'exact', head: true })
      .eq('lease_id', lease.id)
      .eq('recipient_profile_id', myProfileId)
      .is('read_at', null);

    results.push({
      leaseId: lease.id,
      otherPersonName: tenantProfile.full_name ?? tenantProfile.email,
      otherPersonProfileId: tenantProfile.id,
      propertyName: propertyNameMap.get(unitPropertyMap.get(lease.unit_id) ?? '') ?? 'Unknown',
      lastMessage: messages?.[0]?.body ?? null,
      lastMessageAt: messages?.[0]?.created_at ?? null,
      unreadCount: count ?? 0,
    });
  }

  return results.sort((a, b) => (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? ''));
}
