import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getQuitNoticesForLease,
  revokeQuitNotice,
  serveQuitNotice,
} from '../services/quitNoticeService';
import type { QuitNoticeFormInput } from '../schemas';
import { useAuthContext } from '@/providers/AuthProvider';

export function useServeQuitNotice() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leaseId,
      tenantProfileId,
      propertyName,
      input,
    }: {
      leaseId: string;
      tenantProfileId: string;
      propertyName: string;
      input: QuitNoticeFormInput;
    }) => serveQuitNotice(leaseId, profile!.id, tenantProfileId, propertyName, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['quit-notices', variables.leaseId],
      });
    },
  });
}

export function useQuitNoticesForLease(leaseId: string | undefined) {
  return useQuery({
    queryKey: ['quit-notices', leaseId],
    queryFn: () => getQuitNoticesForLease(leaseId as string),
    enabled: !!leaseId,
  });
}

export function useRevokeQuitNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noticeId,
      tenantProfileId,
      propertyName,
    }: {
      noticeId: string;
      tenantProfileId: string;
      propertyName: string;
      leaseId: string;
    }) => revokeQuitNotice(noticeId, tenantProfileId, propertyName),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['quit-notices', variables.leaseId],
      });
    },
  });
}
