import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/slug';
import type { PropertyFormInput } from '../schemas';

export interface LandlordPropertyListItem {
  id: string;
  propertyName: string;
  slug: string;
  city: string;
  state: string;
  status: string;
  coverImage: string | null;
  totalUnits: number;
}

export async function getLandlordId(profileId: string): Promise<string> {
  const { data, error } = await supabase
    .from('landlords')
    .select('id')
    .eq('profile_id', profileId)
    .single();
  if (error || !data) throw new Error('No landlord record found for this account.');
  return data.id;
}

export async function getLandlordProperties(
  landlordId: string
): Promise<LandlordPropertyListItem[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('id, property_name, slug, city, state, status, cover_image, units(id)')
    .eq('landlord_id', landlordId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    propertyName: row.property_name,
    slug: row.slug,
    city: row.city,
    state: row.state,
    status: row.status,
    coverImage: row.cover_image,
    totalUnits: row.units?.length ?? 0,
  }));
}

async function generateUniqueSlug(propertyName: string): Promise<string> {
  const base = slugify(propertyName);
  let candidate = base;
  let attempt = 0;

  while (attempt < 5) {
    const { data } = await supabase
      .from('properties')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (!data) return candidate;
    attempt += 1;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return candidate;
}

export async function uploadPropertyImage(propertyId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${propertyId}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('property-images').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function createProperty(
  landlordId: string,
  input: PropertyFormInput,
  imageFiles: File[],
  coverIndex: number
): Promise<string> {
  const slug = await generateUniqueSlug(input.propertyName);

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .insert({
      landlord_id: landlordId,
      property_name: input.propertyName,
      slug,
      description: input.description ?? null,
      property_type: input.propertyType,
      status: 'draft',
      address: input.address,
      city: input.city,
      state: input.state,
      country: input.country,
    })
    .select('id')
    .single();

  if (propertyError) throw propertyError;
  const propertyId = property.id;

  if (imageFiles.length > 0) {
    const uploadedUrls = await Promise.all(
      imageFiles.map((file) => uploadPropertyImage(propertyId, file))
    );

    const imageRows = uploadedUrls.map((url, index) => ({
      property_id: propertyId,
      image_url: url,
      display_order: index,
      is_cover: index === coverIndex,
    }));

    const { error: imagesError } = await supabase.from('property_images').insert(imageRows);
    if (imagesError) throw imagesError;

    await supabase
      .from('properties')
      .update({ cover_image: uploadedUrls[coverIndex] })
      .eq('id', propertyId);
  }

  if (input.amenityIds.length > 0) {
    const amenityRows = input.amenityIds.map((amenityId) => ({
      property_id: propertyId,
      amenity_id: amenityId,
    }));
    const { error: amenitiesError } = await supabase.from('property_amenities').insert(amenityRows);
    if (amenitiesError) throw amenitiesError;
  }

  return propertyId;
}

export async function updateProperty(propertyId: string, input: PropertyFormInput): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({
      property_name: input.propertyName,
      description: input.description ?? null,
      property_type: input.propertyType,
      address: input.address,
      city: input.city,
      state: input.state,
      country: input.country,
    })
    .eq('id', propertyId);
  if (error) throw error;

  const { error: deleteError } = await supabase
    .from('property_amenities')
    .delete()
    .eq('property_id', propertyId);
  if (deleteError) throw deleteError;

  if (input.amenityIds.length > 0) {
    const amenityRows = input.amenityIds.map((amenityId) => ({
      property_id: propertyId,
      amenity_id: amenityId,
    }));
    const { error: insertError } = await supabase.from('property_amenities').insert(amenityRows);
    if (insertError) throw insertError;
  }
}

export async function publishProperty(propertyId: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ status: 'active' })
    .eq('id', propertyId);
  if (error) throw error;
}

export async function archiveProperty(propertyId: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ status: 'archived' })
    .eq('id', propertyId);
  if (error) throw error;
}

export async function deleteProperty(propertyId: string): Promise<void> {
  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('id')
    .eq('property_id', propertyId)
    .limit(1);
  if (unitsError) throw unitsError;

  if (units && units.length > 0) {
    throw new Error(
      'Cannot delete a property that still has units. Archive it instead, or remove its units first.'
    );
  }

  const { error } = await supabase.from('properties').delete().eq('id', propertyId);
  if (error) throw error;
}

export async function getPropertyForEdit(propertyId: string): Promise<PropertyFormInput> {
  const { data, error } = await supabase
    .from('properties')
    .select(
      `property_name, description, property_type, address, city, state, country,
       property_amenities(amenity_id)`
    )
    .eq('id', propertyId)
    .single();

  if (error) throw error;

  return {
    propertyName: data.property_name,
    description: data.description ?? '',
    propertyType: data.property_type as PropertyFormInput['propertyType'],
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country ?? 'Nigeria',
    amenityIds: (data.property_amenities as any[]).map((pa) => pa.amenity_id),
  };
}
