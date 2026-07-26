import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serveQuitNotice, getQuitNoticesForLease } from '../services/quitNoticeService';
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
      queryClient.invalidateQueries({ queryKey: ['quit-notices', variables.leaseId] });
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
