import { supabase } from '@/lib/supabase';

export async function getFavoriteIds(profileId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_properties')
    .select('property_id')
    .eq('profile_id', profileId);
  if (error) throw error;
  return (data ?? []).map((row) => row.property_id);
}

export async function addFavorite(profileId: string, propertyId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_properties')
    .insert({ profile_id: profileId, property_id: propertyId });
  if (error) throw error;
}

export async function removeFavorite(profileId: string, propertyId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_properties')
    .delete()
    .eq('profile_id', profileId)
    .eq('property_id', propertyId);
  if (error) throw error;
}

export interface FavoritePropertyItem {
  id: string;
  slug: string;
  propertyName: string;
  city: string;
  state: string;
  coverImage: string | null;
}

export async function getFavoriteProperties(profileId: string): Promise<FavoritePropertyItem[]> {
  const { data, error } = await supabase
    .from('saved_properties')
    .select('properties!inner(id, slug, property_name, city, state, cover_image)')
    .eq('profile_id', profileId);
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.properties.id,
    slug: row.properties.slug,
    propertyName: row.properties.property_name,
    city: row.properties.city,
    state: row.properties.state,
    coverImage: row.properties.cover_image,
  }));
}
