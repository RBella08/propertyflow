import { supabase } from '@/lib/supabase';

export interface ProfileDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export async function getMyProfile(userId: string): Promise<ProfileDetail> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone, avatar_url, address, city, state, country')
    .eq('user_id', userId)
    .single();
  if (error) throw error;

  return {
    id: data.id,
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? '',
    email: data.email,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
  };
}

export interface ProfileUpdateInput {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export async function updateMyProfile(profileId: string, input: ProfileUpdateInput): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone || null,
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      country: input.country || null,
    })
    .eq('id', profileId);
  if (error) throw error;
}

export async function uploadAvatar(profileId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${profileId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', profileId);
  if (updateError) throw updateError;

  return data.publicUrl;
}
