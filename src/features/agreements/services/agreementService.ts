import { supabase } from '@/lib/supabase';
import type { AgreementFormInput } from '../schemas';

export interface AgreementDetail {
  id: string;
  leaseId: string;
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorEmail: string | null;
  guarantorAddress: string | null;
  guarantorRelationship: string | null;
  rulesAcknowledged: boolean;
  signatureData: string | null;
  typedName: string | null;
  signedAt: string | null;
  status: string;
}

function mapAgreement(data: any): AgreementDetail {
  return {
    id: data.id,
    leaseId: data.lease_id,
    guarantorName: data.guarantor_name,
    guarantorPhone: data.guarantor_phone,
    guarantorEmail: data.guarantor_email,
    guarantorAddress: data.guarantor_address,
    guarantorRelationship: data.guarantor_relationship,
    rulesAcknowledged: data.rules_acknowledged,
    signatureData: data.signature_data,
    typedName: data.typed_name,
    signedAt: data.signed_at,
    status: data.status,
  };
}

export async function getAgreementForLease(leaseId: string): Promise<AgreementDetail | null> {
  const { data, error } = await supabase
    .from('lease_agreements')
    .select('*')
    .eq('lease_id', leaseId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load agreement: ${error.message}`);
  if (!data) return null;
  return mapAgreement(data);
}

async function ensureAgreementExists(leaseId: string): Promise<AgreementDetail> {
  const existing = await getAgreementForLease(leaseId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('lease_agreements')
    .insert({ lease_id: leaseId })
    .select('*')
    .single();
  if (error) throw new Error(`Failed to create agreement record: ${error.message}`);
  return mapAgreement(data);
}

export async function getMyActiveLeaseAgreement(
  tenantId: string
): Promise<{ leaseId: string; agreement: AgreementDetail } | null> {
  const { data: lease, error: leaseError } = await supabase
    .from('leases')
    .select('id')
    .eq('tenant_id', tenantId)
    .in('status', ['active', 'renewed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (leaseError) throw new Error(`Failed to load lease: ${leaseError.message}`);
  if (!lease) return null;

  const agreement = await ensureAgreementExists(lease.id);
  return { leaseId: lease.id, agreement };
}

export async function hasApprovedIdDocument(tenantProfileId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('id_verifications')
    .select('id')
    .eq('tenant_profile_id', tenantProfileId)
    .in('status', ['pending', 'approved'])
    .limit(1);
  if (error) throw error;
  return !!data && data.length > 0;
}

export async function signAgreement(
  agreementId: string,
  landlordProfileId: string,
  input: AgreementFormInput,
  signatureDataUrl: string
): Promise<void> {
  const { error } = await supabase
    .from('lease_agreements')
    .update({
      guarantor_name: input.guarantorName,
      guarantor_phone: input.guarantorPhone,
      guarantor_email: input.guarantorEmail,
      guarantor_address: input.guarantorAddress,
      guarantor_relationship: input.guarantorRelationship,
      rules_acknowledged: input.rulesAcknowledged,
      signature_data: signatureDataUrl,
      typed_name: input.typedName,
      signed_at: new Date().toISOString(),
      status: 'signed',
    })
    .eq('id', agreementId);
  if (error) throw error;

  await supabase.from('notifications').insert({
    user_id: landlordProfileId,
    title: 'Tenancy agreement signed',
    message: `${input.typedName} has completed and signed their tenancy agreement.`,
    type: 'announcement',
  });
}
