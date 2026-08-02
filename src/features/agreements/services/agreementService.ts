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

export async function getAgreementForLease(leaseId: string): Promise<AgreementDetail | null> {
  const { data, error } = await supabase
    .from('lease_agreements')
    .select('*')
    .eq('lease_id', leaseId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

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

export async function getMyActiveLeaseAgreement(
  tenantId: string
): Promise<{ leaseId: string; agreement: AgreementDetail | null } | null> {
  const { data: lease } = await supabase
    .from('leases')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .maybeSingle();

  if (!lease) return null;

  const agreement = await getAgreementForLease(lease.id);
  return { leaseId: lease.id, agreement };
}

export async function hasApprovedIdDocument(tenantProfileId: string): Promise<boolean> {
  const { data } = await supabase
    .from('id_verifications')
    .select('id')
    .eq('tenant_profile_id', tenantProfileId)
    .in('status', ['pending', 'approved'])
    .limit(1);
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
