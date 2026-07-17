import { supabase } from '@/lib/supabase';
import { getLandlordId } from '@/features/properties/services/propertyManagementService';
import type { UnitFormInput } from '../schemas';

export interface LandlordUnitItem {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  status: string;
}

export interface LandlordPropertyOption {
  id: string;
  propertyName: string;
}

export async function getLandlordPropertyOptions(
  profileId: string
): Promise<LandlordPropertyOption[]> {
  const landlordId = await getLandlordId(profileId);
  const { data, error } = await supabase
    .from('properties')
    .select('id, property_name')
    .eq('landlord_id', landlordId)
    .order('property_name');
  if (error) throw error;
  return (data ?? []).map((p) => ({ id: p.id, propertyName: p.property_name }));
}

export async function getLandlordUnits(profileId: string): Promise<LandlordUnitItem[]> {
  const landlordId = await getLandlordId(profileId);
  const { data, error } = await supabase
    .from('units')
    .select(
      'id, property_id, unit_number, bedrooms, bathrooms, rent_amount, status, properties!inner(property_name, landlord_id)'
    )
    .eq('properties.landlord_id', landlordId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    propertyId: row.property_id,
    propertyName: row.properties.property_name,
    unitNumber: row.unit_number,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    rentAmount: row.rent_amount,
    status: row.status,
  }));
}

export async function getUnitById(unitId: string): Promise<UnitFormInput> {
  const { data, error } = await supabase
    .from('units')
    .select('property_id, unit_number, bedrooms, bathrooms, rent_amount, status')
    .eq('id', unitId)
    .single();
  if (error) throw error;

  return {
    propertyId: data.property_id,
    unitNumber: data.unit_number,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    rentAmount: data.rent_amount,
    status: data.status,
  };
}

async function assertUniqueUnitNumber(
  propertyId: string,
  unitNumber: string,
  excludeUnitId?: string
) {
  let query = supabase
    .from('units')
    .select('id')
    .eq('property_id', propertyId)
    .ilike('unit_number', unitNumber);

  if (excludeUnitId) query = query.neq('id', excludeUnitId);

  const { data, error } = await query;
  if (error) throw error;
  if (data && data.length > 0) {
    throw new Error(`Unit "${unitNumber}" already exists in this property.`);
  }
}

export async function createUnit(input: UnitFormInput): Promise<void> {
  await assertUniqueUnitNumber(input.propertyId, input.unitNumber);

  const { error } = await supabase.from('units').insert({
    property_id: input.propertyId,
    unit_number: input.unitNumber,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    rent_amount: input.rentAmount,
    status: input.status,
  });
  if (error) throw error;
}

export async function updateUnit(unitId: string, input: UnitFormInput): Promise<void> {
  await assertUniqueUnitNumber(input.propertyId, input.unitNumber, unitId);

  const { data: current, error: currentError } = await supabase
    .from('units')
    .select('status')
    .eq('id', unitId)
    .single();
  if (currentError) throw currentError;

  // FEATURES.md business rule: occupied units cannot be silently
  // reassigned to a different status through a plain edit — that
  // transition must go through Terminate/Renew Lease flows instead
  // (built in the Lease Management step).
  if (current.status === 'occupied' && input.status !== 'occupied') {
    throw new Error(
      'This unit is currently occupied. End the active lease before changing its status.'
    );
  }

  const { error } = await supabase
    .from('units')
    .update({
      unit_number: input.unitNumber,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      rent_amount: input.rentAmount,
      status: input.status,
    })
    .eq('id', unitId);
  if (error) throw error;
}
