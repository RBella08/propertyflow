import { supabase } from '@/lib/supabase';
import { getLandlordId } from '@/features/properties/services/propertyManagementService';
import type { VendorFormInput } from '../schemas';

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

export async function getVendors(profileId: string): Promise<VendorItem[]> {
  const landlordId = await getLandlordId(profileId);
  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, category, phone, email, notes')
    .eq('landlord_id', landlordId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createVendor(profileId: string, input: VendorFormInput): Promise<void> {
  const landlordId = await getLandlordId(profileId);
  const { error } = await supabase.from('vendors').insert({
    landlord_id: landlordId,
    name: input.name,
    category: input.category,
    phone: input.phone || null,
    email: input.email || null,
    notes: input.notes || null,
  });
  if (error) throw error;
}

export async function deleteVendor(vendorId: string): Promise<void> {
  const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
  if (error) throw error;
}

export async function assignVendorToRequest(requestId: string, vendorId: string): Promise<void> {
  const { error } = await supabase
    .from('maintenance_requests')
    .update({ assigned_vendor_id: vendorId })
    .eq('id', requestId);
  if (error) throw error;
}
