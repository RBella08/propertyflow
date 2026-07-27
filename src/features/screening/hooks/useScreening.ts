import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitScreeningReview,
  getScreeningSummary,
  hasReviewedLease,
} from '../services/screeningService';
import type { ScreeningReviewFormInput } from '../schemas';
import { useAuthContext } from '@/providers/AuthProvider';

export function useScreeningSummary(tenantProfileId: string | undefined) {
  return useQuery({
    queryKey: ['screening-summary', tenantProfileId],
    queryFn: () => getScreeningSummary(tenantProfileId as string),
    enabled: !!tenantProfileId,
  });
}

export function useHasReviewedLease(leaseId: string | undefined) {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['has-reviewed-lease', profile?.id, leaseId],
    queryFn: () => hasReviewedLease(profile!.id, leaseId as string),
    enabled: !!profile?.id && !!leaseId,
  });
}

export function useSubmitScreeningReview() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tenantProfileId,
      leaseId,
      input,
    }: {
      tenantProfileId: string;
      leaseId: string;
      input: ScreeningReviewFormInput;
    }) => submitScreeningReview(profile!.id, tenantProfileId, leaseId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['screening-summary', variables.tenantProfileId] });
      queryClient.invalidateQueries({ queryKey: ['has-reviewed-lease'] });
    },
  });
}
