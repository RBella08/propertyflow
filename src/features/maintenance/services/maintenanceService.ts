import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { getLandlordId } from '@/features/properties/services/propertyManagementService';
import type { MaintenanceFormInput } from '../schemas';

export interface MaintenanceListItem {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

export interface LandlordMaintenanceItem extends MaintenanceListItem {
  propertyName: string;
  unitNumber: string;
  tenantName: string;
}

export interface MaintenanceDetail {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  images: string[];
}

export async function getTenantId(profileId: string): Promise<string> {
  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('profile_id', profileId)
    .single();
  if (error || !data) throw new Error('No tenant record found for this account.');
  return data.id;
}

async function getActiveUnitForTenant(tenantId: string) {
  const { data, error } = await supabase
    .from('leases')
    .select('unit_id, units!inner(property_id)')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('You need an active lease before submitting a maintenance request.');

  return { unitId: data.unit_id, propertyId: (data as any).units.property_id };
}

export async function createMaintenanceRequest(
  tenantId: string,
  input: MaintenanceFormInput,
  imageFiles: File[]
): Promise<void> {
  const { unitId, propertyId } = await getActiveUnitForTenant(tenantId);

  const { data: request, error: requestError } = await supabase
    .from('maintenance_requests')
    .insert({
      tenant_id: tenantId,
      unit_id: unitId,
      property_id: propertyId,
      category: input.category,
      priority: input.priority,
      subject: input.subject,
      description: input.description,
      status: 'submitted',
    })
    .select('id')
    .single();

  if (requestError) throw requestError;

  if (imageFiles.length > 0) {
    const uploadedUrls = await Promise.all(
      imageFiles.map(async (file) => {
        const ext = file.name.split('.').pop();
        const path = `${request.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('maintenance-images')
          .upload(path, file);
        if (uploadError) throw uploadError;
        return supabase.storage.from('maintenance-images').getPublicUrl(path).data.publicUrl;
      })
    );

    const { error: imagesError } = await supabase
      .from('maintenance_images')
      .insert(uploadedUrls.map((url) => ({ maintenance_request_id: request.id, image_url: url })));
    if (imagesError) throw imagesError;
  }
}

export async function getTenantMaintenanceRequests(
  tenantId: string
): Promise<MaintenanceListItem[]> {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('id, subject, category, priority, status, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    subject: r.subject,
    category: r.category,
    priority: r.priority ?? 'low',
    status: r.status ?? 'submitted',
    createdAt: r.created_at ?? '',
  }));
}

export async function getMaintenanceDetail(requestId: string): Promise<MaintenanceDetail> {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(
      'id, subject, description, category, priority, status, created_at, resolved_at, maintenance_images(image_url)'
    )
    .eq('id', requestId)
    .single();

  if (error) throw error;
  const row = data as any;

  return {
    id: row.id,
    subject: row.subject,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    images: (row.maintenance_images ?? []).map((img: any) => img.image_url),
  };
}

export async function getManagerMaintenanceRequests(
  profileId: string
): Promise<LandlordMaintenanceItem[]> {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(
      `id, subject, category, priority, status, created_at,
       properties!inner(property_name, manager_id),
       units!inner(unit_number),
       tenants!inner(profiles!inner(full_name, email))`
    )
    .eq('properties.manager_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    subject: row.subject,
    category: row.category,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    propertyName: row.properties.property_name,
    unitNumber: row.units.unit_number,
    tenantName: row.tenants.profiles.full_name ?? row.tenants.profiles.email,
  }));
}

export async function getLandlordMaintenanceRequests(
  profileId: string
): Promise<LandlordMaintenanceItem[]> {
  const landlordId = await getLandlordId(profileId);

  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(
      `id, subject, category, priority, status, created_at,
       properties!inner(property_name, landlord_id),
       units!inner(unit_number),
       tenants!inner(profiles!inner(full_name, email))`
    )
    .eq('properties.landlord_id', landlordId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    subject: row.subject,
    category: row.category,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    propertyName: row.properties.property_name,
    unitNumber: row.units.unit_number,
    tenantName: row.tenants.profiles.full_name ?? row.tenants.profiles.email,
  }));
}

const STATUS_ORDER = ['submitted', 'assigned', 'in_progress', 'completed', 'closed'];

export async function updateMaintenanceStatus(
  requestId: string,
  newStatus: Database['public']['Enums']['maintenance_status']
): Promise<void> {
  const { data: current, error: currentError } = await supabase
    .from('maintenance_requests')
    .select('status')
    .eq('id', requestId)
    .single();
  if (currentError) throw currentError;

  const currentStatus = current.status ?? 'submitted';

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const newIndex = STATUS_ORDER.indexOf(newStatus);

  // Guard: block skipping backward, or jumping more than one stage forward
  // at a time (e.g. Submitted straight to Completed).
  if (newIndex < currentIndex) {
    throw new Error('Cannot move a request back to an earlier status.');
  }
  if (newIndex > currentIndex + 1) {
    throw new Error(
      `Please move through each stage in order. Next allowed status: "${STATUS_ORDER[currentIndex + 1]}".`
    );
  }

  const updates: Database['public']['Tables']['maintenance_requests']['Update'] = {
    status: newStatus,
  };

  if (newStatus === 'completed') {
    updates.resolved_at = new Date().toISOString();
  }

  const { error } = await supabase.from('maintenance_requests').update(updates).eq('id', requestId);
  if (error) throw error;
}
