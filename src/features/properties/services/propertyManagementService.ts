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
  managerId: string | null;
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
    .select('id, property_name, slug, city, state, status, cover_image, manager_id, units(id)')
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
    managerId: row.manager_id,
    totalUnits: row.units?.length ?? 0,
  }));
}

export async function findManagerByEmail(
  email: string
): Promise<{ profileId: string; fullName: string }> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (error) throw error;
  if (!profile) throw new Error('No account found with that email.');
  if (profile.role !== 'manager') throw new Error('That account is not registered as a manager.');

  return { profileId: profile.id, fullName: profile.full_name ?? profile.email };
}

export async function assignManagerToProperty(
  propertyId: string,
  managerProfileId: string | null
): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ manager_id: managerProfileId })
    .eq('id', propertyId);
  if (error) throw error;
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

async function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Could not read image'));

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Could not load image'));

    reader.readAsDataURL(file);
  });
}

export async function uploadPropertyImage(propertyId: string, file: File): Promise<string> {
  const compressed = await compressImage(file);
  const filePath = `${propertyId}/${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(filePath, compressed, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('property-images').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function addPropertyImages(propertyId: string, files: File[]): Promise<void> {
  if (files.length === 0) return;

  const { data: existingImages } = await supabase
    .from('property_images')
    .select('display_order')
    .eq('property_id', propertyId)
    .order('display_order', { ascending: false })
    .limit(1);

  const lastDisplayOrder = existingImages?.[0]?.display_order ?? -1;
  const startOrder = lastDisplayOrder + 1;

  const uploadedUrls = await Promise.all(
    files.map((file) => uploadPropertyImage(propertyId, file))
  );

  const { data: hasCover } = await supabase
    .from('properties')
    .select('cover_image')
    .eq('id', propertyId)
    .single();

  const imageRows = uploadedUrls.map((url, index) => ({
    property_id: propertyId,
    image_url: url,
    display_order: startOrder + index,
    is_cover: !hasCover?.cover_image && index === 0,
  }));

  const { error } = await supabase.from('property_images').insert(imageRows);
  if (error) throw error;

  if (!hasCover?.cover_image) {
    await supabase.from('properties').update({ cover_image: uploadedUrls[0] }).eq('id', propertyId);
  }
}

export interface PropertyImageItem {
  id: string;
  imageUrl: string;
  isCover: boolean;
}

export async function getPropertyImages(propertyId: string): Promise<PropertyImageItem[]> {
  const { data, error } = await supabase
    .from('property_images')
    .select('id, image_url, is_cover')
    .eq('property_id', propertyId)
    .order('display_order');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    imageUrl: row.image_url,
    isCover: row.is_cover ?? false,
  }));
}

export async function setPropertyCoverImage(
  propertyId: string,
  imageId: string,
  imageUrl: string
): Promise<void> {
  await supabase.from('property_images').update({ is_cover: false }).eq('property_id', propertyId);
  const { error } = await supabase
    .from('property_images')
    .update({ is_cover: true })
    .eq('id', imageId);
  if (error) throw error;
  await supabase.from('properties').update({ cover_image: imageUrl }).eq('id', propertyId);
}

export async function deletePropertyImage(imageId: string): Promise<void> {
  const { error } = await supabase.from('property_images').delete().eq('id', imageId);
  if (error) throw error;
}

export async function createProperty(
  landlordId: string,
  input: PropertyFormInput,
  imageFiles: File[],
  coverIndex: number
): Promise<string> {
  const { data: landlordRow } = await supabase
    .from('landlords')
    .select('plan_id, subscription_plans(property_limit, name)')
    .eq('id', landlordId)
    .single();

  const { count: currentCount } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('landlord_id', landlordId);

  const limit = (landlordRow as any)?.subscription_plans?.property_limit ?? 5;

  if ((currentCount ?? 0) >= limit) {
    throw new Error(
      `You've reached your plan's limit of ${limit} properties. Upgrade your plan to add more.`
    );
  }

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

export interface ManagerPropertyItem {
  id: string;
  propertyName: string;
  slug: string;
  city: string;
  state: string;
  status: string;
  coverImage: string | null;
  totalUnits: number;
  occupiedUnits: number;
}

export async function getManagerProperties(profileId: string): Promise<ManagerPropertyItem[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('id, property_name, slug, city, state, status, cover_image, units(id, status)')
    .eq('manager_id', profileId)
    .order('property_name');
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
    occupiedUnits: (row.units ?? []).filter((u: any) => u.status === 'occupied').length,
  }));
}

export interface ManagerDashboardData {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  openMaintenanceCount: number;
}

export async function getManagerDashboardData(profileId: string): Promise<ManagerDashboardData> {
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, units(status)')
    .eq('manager_id', profileId);
  if (error) throw error;

  const propertyIds = (properties ?? []).map((p: any) => p.id);
  const allUnits = (properties ?? []).flatMap((p: any) => p.units ?? []);
  const occupiedUnits = allUnits.filter((u: any) => u.status === 'occupied').length;
  const totalUnits = allUnits.length;

  let openMaintenanceCount = 0;
  if (propertyIds.length > 0) {
    const { count } = await supabase
      .from('maintenance_requests')
      .select('id', { count: 'exact', head: true })
      .in('property_id', propertyIds)
      .in('status', ['submitted', 'assigned', 'in_progress']);
    openMaintenanceCount = count ?? 0;
  }

  return {
    totalProperties: propertyIds.length,
    totalUnits,
    occupiedUnits,
    vacantUnits: totalUnits - occupiedUnits,
    occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
    openMaintenanceCount,
  };
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

export async function unarchiveProperty(propertyId: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ status: 'draft' })
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
