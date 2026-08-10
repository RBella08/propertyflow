import { supabase } from '@/lib/supabase';

export type DocumentType = 'nin_slip' | 'bvn_slip' | 'passport' | 'drivers_license' | 'voters_card';

export interface VerificationItem {
  id: string;
  documentType: DocumentType;
  documentPath: string;
  status: string;
  reviewNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  expiryDate: string | null;
  signedUrl: string | null;
}

async function getSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('id-documents').createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

export async function submitVerification(
  tenantProfileId: string,
  documentType: DocumentType,
  file: File,
  expiryDate?: string
): Promise<void> {
  const ext = file.name.split('.').pop();
  const path = `${tenantProfileId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('id-documents').upload(path, file);
  if (uploadError) throw uploadError;

  const { error } = await supabase.from('id_verifications').insert({
    tenant_profile_id: tenantProfileId,
    document_type: documentType,
    document_url: path,
    status: 'pending',
    expiry_date: expiryDate || null,
  });
  if (error) throw error;
}

export async function getMyVerifications(tenantProfileId: string): Promise<VerificationItem[]> {
  const { data, error } = await supabase
    .from('id_verifications')
    .select(
      'id, document_type, document_url, status, review_note, submitted_at, reviewed_at, expiry_date'
    )
    .eq('tenant_profile_id', tenantProfileId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (v) => ({
      id: v.id,
      documentType: v.document_type as DocumentType,
      documentPath: v.document_url,
      status: v.status,
      reviewNote: v.review_note,
      submittedAt: v.submitted_at,
      reviewedAt: v.reviewed_at,
      expiryDate: v.expiry_date,
      signedUrl: await getSignedUrl(v.document_url),
    }))
  );
}

export async function getTenantVerifications(tenantProfileId: string): Promise<VerificationItem[]> {
  const { data, error } = await supabase
    .from('id_verifications')
    .select(
      'id, document_type, document_url, status, review_note, submitted_at, reviewed_at, expiry_date'
    )
    .eq('tenant_profile_id', tenantProfileId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (v) => ({
      id: v.id,
      documentType: v.document_type as DocumentType,
      documentPath: v.document_url,
      status: v.status,
      reviewNote: v.review_note,
      submittedAt: v.submitted_at,
      reviewedAt: v.reviewed_at,
      expiryDate: v.expiry_date,
      signedUrl: await getSignedUrl(v.document_url),
    }))
  );
}

export async function reviewVerification(
  verificationId: string,
  reviewerProfileId: string,
  tenantProfileId: string,
  status: 'approved' | 'rejected',
  note: string
): Promise<void> {
  const { error } = await supabase
    .from('id_verifications')
    .update({
      status,
      review_note: note || null,
      reviewed_by_profile_id: reviewerProfileId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', verificationId);
  if (error) throw error;

  await supabase.from('notifications').insert({
    user_id: tenantProfileId,
    title: status === 'approved' ? 'ID document approved' : 'ID document needs attention',
    message:
      status === 'approved'
        ? 'Your submitted identification document has been approved.'
        : `Your submitted document was not approved.${note ? ` Reason: ${note}` : ''}`,
    type: 'announcement',
  });
}

export async function deletePendingVerification(
  verificationId: string,
  documentPath: string
): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from('id-documents')
    .remove([documentPath]);
  if (storageError) throw storageError;

  const { error } = await supabase.from('id_verifications').delete().eq('id', verificationId);
  if (error) throw error;
}
