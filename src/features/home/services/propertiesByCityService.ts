import { supabase } from '@/lib/supabase';

export interface CityGroup {
  city: string;
  state: string;
  propertyCount: number;
}

export async function getPropertiesByCity(): Promise<CityGroup[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('city, state')
    .eq('status', 'active');
  if (error) throw error;

  const grouped = new Map<string, CityGroup>();
  (data ?? []).forEach((p) => {
    const key = `${p.city}-${p.state}`;
    if (!grouped.has(key)) grouped.set(key, { city: p.city, state: p.state, propertyCount: 0 });
    grouped.get(key)!.propertyCount += 1;
  });

  return Array.from(grouped.values())
    .sort((a, b) => b.propertyCount - a.propertyCount)
    .slice(0, 8);
}
