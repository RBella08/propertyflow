import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitVerification,
  getMyVerifications,
  getTenantVerifications,
  reviewVerification,
  deletePendingVerification,
  type DocumentType,
} from '../services/idVerificationService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useMyVerifications() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['my-verifications', profile?.id],
    queryFn: () => getMyVerifications(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useTenantVerifications(tenantProfileId: string | undefined) {
  return useQuery({
    queryKey: ['tenant-verifications', tenantProfileId],
    queryFn: () => getTenantVerifications(tenantProfileId as string),
    enabled: !!tenantProfileId,
  });
}

export function useSubmitVerification() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentType,
      file,
      expiryDate,
    }: {
      documentType: DocumentType;
      file: File;
      expiryDate?: string;
    }) => submitVerification(profile!.id, documentType, file, expiryDate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-verifications', profile?.id] }),
  });
}

export function useReviewVerification() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      verificationId,
      tenantProfileId,
      status,
      note,
    }: {
      verificationId: string;
      tenantProfileId: string;
      status: 'approved' | 'rejected';
      note: string;
    }) => reviewVerification(verificationId, profile!.id, tenantProfileId, status, note),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tenant-verifications', variables.tenantProfileId],
      });
    },
  });
}

export function useDeletePendingVerification() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      verificationId,
      documentPath,
    }: {
      verificationId: string;
      documentPath: string;
    }) => deletePendingVerification(verificationId, documentPath),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-verifications', profile?.id] }),
  });
}
