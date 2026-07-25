import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { getLandlordId } from '@/features/properties/services/propertyManagementService';
import { slugify } from '@/lib/slug';

export interface ParsedRow {
  propertyName: string;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
}

export interface ImportRowResult {
  row: number;
  propertyName: string;
  unitNumber: string;
  status: 'success' | 'error';
  message: string;
}

const REQUIRED_HEADERS = [
  'property_name',
  'property_type',
  'address',
  'city',
  'state',
  'unit_number',
  'bedrooms',
  'bathrooms',
  'rent_amount',
];

export function parseImportFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

        if (rows.length === 0) throw new Error('The file appears to be empty');

        const headers = Object.keys(rows[0]).map((h) => h.trim().toLowerCase());
        const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
        if (missing.length > 0) {
          throw new Error(`Missing required column(s): ${missing.join(', ')}`);
        }

        const parsed: ParsedRow[] = rows.map((row: any) => ({
          propertyName: String(row.property_name ?? '').trim(),
          propertyType: String(row.property_type ?? '')
            .trim()
            .toLowerCase(),
          address: String(row.address ?? '').trim(),
          city: String(row.city ?? '').trim(),
          state: String(row.state ?? '').trim(),
          unitNumber: String(row.unit_number ?? '').trim(),
          bedrooms: Number(row.bedrooms) || 0,
          bathrooms: Number(row.bathrooms) || 0,
          rentAmount: Number(row.rent_amount) || 0,
        }));

        resolve(parsed);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not read this file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the file'));
    reader.readAsBinaryString(file);
  });
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

export async function importRows(profileId: string, rows: ParsedRow[]): Promise<ImportRowResult[]> {
  const landlordId = await getLandlordId(profileId);
  const results: ImportRowResult[] = [];

  // Group rows by property name so multiple units under the same
  // property in the sheet reuse one property record, not duplicates.
  const propertyCache = new Map<string, string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // account for header row + 1-indexing

    try {
      if (!row.propertyName || !row.unitNumber) {
        throw new Error('Missing property name or unit number');
      }

      let propertyId = propertyCache.get(row.propertyName.toLowerCase());

      if (!propertyId) {
        const { data: existing } = await supabase
          .from('properties')
          .select('id')
          .eq('landlord_id', landlordId)
          .ilike('property_name', row.propertyName)
          .maybeSingle();

        if (existing) {
          propertyId = existing.id;
        } else {
          const slug = await generateUniqueSlug(row.propertyName);
          const { data: created, error: createError } = await supabase
            .from('properties')
            .insert({
              landlord_id: landlordId,
              property_name: row.propertyName,
              slug,
              property_type: row.propertyType || 'apartment',
              status: 'draft',
              address: row.address,
              city: row.city,
              state: row.state,
              country: 'Nigeria',
            })
            .select('id')
            .single();
          if (createError) throw createError;
          propertyId = created.id;
        }
        propertyCache.set(row.propertyName.toLowerCase(), propertyId);
      }

      const { data: existingUnit } = await supabase
        .from('units')
        .select('id')
        .eq('property_id', propertyId)
        .ilike('unit_number', row.unitNumber)
        .maybeSingle();

      if (existingUnit) {
        throw new Error(`Unit "${row.unitNumber}" already exists in this property`);
      }

      const { error: unitError } = await supabase.from('units').insert({
        property_id: propertyId,
        unit_number: row.unitNumber,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        rent_amount: row.rentAmount,
        status: 'available',
      });
      if (unitError) throw unitError;

      results.push({
        row: rowNumber,
        propertyName: row.propertyName,
        unitNumber: row.unitNumber,
        status: 'success',
        message: 'Imported successfully',
      });
    } catch (error) {
      results.push({
        row: rowNumber,
        propertyName: row.propertyName || '(missing)',
        unitNumber: row.unitNumber || '(missing)',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

export function downloadSampleTemplate() {
  const sample = [
    {
      property_name: 'Sunrise Apartments',
      property_type: 'apartment',
      address: '12 Admiralty Way',
      city: 'Lagos',
      state: 'Lagos',
      unit_number: 'A1',
      bedrooms: 2,
      bathrooms: 2,
      rent_amount: 1800000,
    },
    {
      property_name: 'Sunrise Apartments',
      property_type: 'apartment',
      address: '12 Admiralty Way',
      city: 'Lagos',
      state: 'Lagos',
      unit_number: 'A2',
      bedrooms: 3,
      bathrooms: 3,
      rent_amount: 2500000,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sample);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Properties');
  XLSX.writeFile(workbook, 'propertyflow_import_template.xlsx');
}
