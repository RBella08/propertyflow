import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAgreementForLease,
  getMyActiveLeaseAgreement,
  hasApprovedIdDocument,
  signAgreement,
} from '../services/agreementService';
import type { AgreementFormInput } from '../schemas';

export function useAgreementForLease(leaseId: string | undefined) {
  return useQuery({
    queryKey: ['agreement', leaseId],
    queryFn: () => getAgreementForLease(leaseId as string),
    enabled: !!leaseId,
  });
}

export function useMyActiveLeaseAgreement(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['my-active-agreement', tenantId],
    queryFn: () => getMyActiveLeaseAgreement(tenantId as string),
    enabled: !!tenantId,
  });
}

export function useHasApprovedIdDocument(tenantProfileId: string | undefined) {
  return useQuery({
    queryKey: ['has-id-document', tenantProfileId],
    queryFn: () => hasApprovedIdDocument(tenantProfileId as string),
    enabled: !!tenantProfileId,
  });
}

export function useSignAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      agreementId,
      landlordProfileId,
      input,
      signatureDataUrl,
    }: {
      agreementId: string;
      landlordProfileId: string;
      input: AgreementFormInput;
      signatureDataUrl: string;
    }) => signAgreement(agreementId, landlordProfileId, input, signatureDataUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-active-agreement'] });
      queryClient.invalidateQueries({ queryKey: ['agreement'] });
    },
  });
}
