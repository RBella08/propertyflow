import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBanks,
  resolveAccountName,
  createSubaccount,
  getMyPayoutInfo,
} from '../services/payoutService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useBanks() {
  return useQuery({ queryKey: ['paystack-banks'], queryFn: getBanks, staleTime: 60 * 60 * 1000 });
}

export function useMyPayoutInfo() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['my-payout-info', profile?.id],
    queryFn: () => getMyPayoutInfo(profile!.id),
    enabled: !!profile?.id,
    retry: false,
  });
}

export function useResolveAccountName() {
  return useMutation({
    mutationFn: ({ accountNumber, bankCode }: { accountNumber: string; bankCode: string }) =>
      resolveAccountName(accountNumber, bankCode),
  });
}

export function useCreateSubaccount() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubaccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-payout-info', profile?.id] }),
  });
}
