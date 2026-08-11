import { supabase } from '@/lib/supabase';

export interface CityGroup {
  city: string;
  state: string;
  propertyCount: number;
}

export async function getPropertiesByCity(): Promise<CityGroup[]> {
  const { data, error } = await supabase
    .from('city_property_counts')
    .select('city, state, property_count')
    .order('property_count', { ascending: false })
    .limit(8);

  if (error) throw error;

  return (data ?? [])
    .filter(
      (
        row
      ): row is typeof row & {
        city: string;
        state: string;
        property_count: number;
      } => row.city !== null && row.state !== null && row.property_count !== null
    )
    .map((row) => ({
      city: row.city,
      state: row.state,
      propertyCount: row.property_count,
    }));
}
