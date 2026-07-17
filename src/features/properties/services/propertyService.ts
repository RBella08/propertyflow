import { supabase } from '@/lib/supabase';

export interface PropertyFilters {
  city?: string;
  state?: string;
  propertyType?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface PropertyListItem {
  id: string;
  slug: string;
  propertyName: string;
  propertyType: string;
  city: string;
  state: string;
  coverImage: string | null;
  minRent: number | null;
  maxRent: number | null;
  minBedrooms: number | null;
  maxBedrooms: number | null;
  availableUnits: number;
}

interface RawPropertyRow {
  id: string;
  slug: string;
  property_name: string;
  property_type: string;
  city: string;
  state: string;
  cover_image: string | null;
  property_images: { image_url: string; is_cover: boolean }[];
  units: { rent_amount: number; bedrooms: number; status: string }[];
}

function toListItem(row: RawPropertyRow): PropertyListItem {
  const available = row.units.filter((u) => u.status === 'available');
  const rents = available.map((u) => u.rent_amount);
  const bedrooms = available.map((u) => u.bedrooms);
  const cover =
    row.cover_image ??
    row.property_images.find((img) => img.is_cover)?.image_url ??
    row.property_images[0]?.image_url ??
    null;

  return {
    id: row.id,
    slug: row.slug,
    propertyName: row.property_name,
    propertyType: row.property_type,
    city: row.city,
    state: row.state,
    coverImage: cover,
    minRent: rents.length ? Math.min(...rents) : null,
    maxRent: rents.length ? Math.max(...rents) : null,
    minBedrooms: bedrooms.length ? Math.min(...bedrooms) : null,
    maxBedrooms: bedrooms.length ? Math.max(...bedrooms) : null,
    availableUnits: available.length,
  };
}

export interface GetPropertiesResult {
  items: PropertyListItem[];
  total: number;
}

export async function getProperties(
  filters: PropertyFilters,
  page: number,
  limit: number
): Promise<GetPropertiesResult> {
  let query = supabase
    .from('properties')
    .select(
      `id, slug, property_name, property_type, city, state, cover_image,
       property_images(image_url, is_cover),
       units(rent_amount, bedrooms, status)`,
      { count: 'exact' }
    )
    .eq('status', 'active');

  if (filters.city) query = query.ilike('city', filters.city);
  if (filters.state) query = query.ilike('state', filters.state);
  if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
  if (filters.search) query = query.ilike('property_name', `%${filters.search}%`);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to).order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;

  let items = (data as unknown as RawPropertyRow[]).map(toListItem);

  // Applied client-side because bedrooms/price live on `units`, aggregated
  // above — see the Step 8 note on this known pagination-count limitation.
  if (filters.bedrooms) {
    items = items.filter(
      (item) =>
        item.minBedrooms !== null &&
        item.maxBedrooms !== null &&
        filters.bedrooms! >= item.minBedrooms &&
        filters.bedrooms! <= item.maxBedrooms
    );
  }
  if (filters.minPrice) {
    items = items.filter((item) => item.maxRent !== null && item.maxRent >= filters.minPrice!);
  }
  if (filters.maxPrice) {
    items = items.filter((item) => item.minRent !== null && item.minRent <= filters.maxPrice!);
  }

  return { items, total: count ?? items.length };
}

export interface PropertyDetail {
  id: string;
  slug: string;
  propertyName: string;
  description: string | null;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  images: { url: string; isCover: boolean }[];
  amenities: { id: string; name: string; icon: string | null }[];
  units: {
    id: string;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    rentAmount: number;
    status: string;
  }[];
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDetail> {
  const { data, error } = await supabase
    .from('properties')
    .select(
      `id, slug, property_name, description, property_type, address, city, state, country,
       latitude, longitude,
       property_images(image_url, is_cover, display_order),
       property_amenities(amenities(id, name, icon)),
       units(id, unit_number, bedrooms, bathrooms, rent_amount, status)`
    )
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error) throw error;

  // Nested Supabase selects return deeply-typed shapes that our starter
  // Database type doesn't fully model yet — this narrows it manually until
  // the real `supabase gen types` output replaces types/database.ts.
  const raw = data as unknown as {
    id: string;
    slug: string;
    property_name: string;
    description: string | null;
    property_type: string;
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    property_images: { image_url: string; is_cover: boolean; display_order: number }[];
    property_amenities: { amenities: { id: string; name: string; icon: string | null } }[];
    units: {
      id: string;
      unit_number: string;
      bedrooms: number;
      bathrooms: number;
      rent_amount: number;
      status: string;
    }[];
  };

  return {
    id: raw.id,
    slug: raw.slug,
    propertyName: raw.property_name,
    description: raw.description,
    propertyType: raw.property_type,
    address: raw.address,
    city: raw.city,
    state: raw.state,
    country: raw.country,
    latitude: raw.latitude,
    longitude: raw.longitude,
    images: [...raw.property_images]
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => ({ url: img.image_url, isCover: img.is_cover })),
    amenities: raw.property_amenities.map((pa) => pa.amenities),
    units: raw.units.map((u) => ({
      id: u.id,
      unitNumber: u.unit_number,
      bedrooms: u.bedrooms,
      bathrooms: u.bathrooms,
      rentAmount: u.rent_amount,
      status: u.status,
    })),
  };
}
