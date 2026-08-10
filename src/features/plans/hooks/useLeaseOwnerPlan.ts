import { useQuery } from '@tanstack/react-query';
import { getLeaseOwnerPlanTier } from '../services/leaseOwnerPlanService';

export function useLeaseOwnerPlanTier(leaseId: string | undefined) {
  return useQuery({
    queryKey: ['lease-owner-plan-tier', leaseId],
    queryFn: () => getLeaseOwnerPlanTier(leaseId as string),
    enabled: !!leaseId,
  });
}
