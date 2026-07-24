import { supabase } from '@/lib/supabase';

export interface HomeStats {
  propertyCount: number;
  cityCount: number;
  availableUnitCount: number;
}

export async function getHomeStats(): Promise<HomeStats> {
  const { count: propertyCount } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: cityRows } = await supabase
    .from('properties')
    .select('city')
    .eq('status', 'active');
  const cityCount = new Set((cityRows ?? []).map((r) => r.city)).size;

  const { count: availableUnitCount } = await supabase
    .from('units')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'available');

  return {
    propertyCount: propertyCount ?? 0,
    cityCount,
    availableUnitCount: availableUnitCount ?? 0,
  };
}
