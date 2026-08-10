import { supabase } from '@/lib/supabase';

export async function getLeaseOwnerPlanTier(leaseId: string): Promise<string> {
  const { data: lease } = await supabase
    .from('leases')
    .select('unit_id')
    .eq('id', leaseId)
    .single();
  if (!lease) return 'Free';

  const { data: unit } = await supabase
    .from('units')
    .select('property_id')
    .eq('id', lease.unit_id)
    .single();
  if (!unit) return 'Free';

  const { data: property } = await supabase
    .from('properties')
    .select('landlord_id')
    .eq('id', unit.property_id)
    .single();
  if (!property) return 'Free';

  const { data: landlordInfo } = await supabase
    .from('landlord_public_info')
    .select('plan_tier')
    .eq('id', property.landlord_id)
    .single();

  return landlordInfo?.plan_tier ?? 'Free';
}
