import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLease, renewLease, terminateLease } from '../services/leaseService';
import type { LeaseFormInput } from '../schemas';

export function useCreateLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeaseFormInput) => createLease(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-leases'] });
      queryClient.invalidateQueries({ queryKey: ['available-units'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-units'] });
    },
  });
}

export function useRenewLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leaseId, newEndDate }: { leaseId: string; newEndDate: string }) =>
      renewLease(leaseId, newEndDate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landlord-leases'] }),
  });
}

export function useTerminateLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaseId: string) => terminateLease(leaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-leases'] });
      queryClient.invalidateQueries({ queryKey: ['available-units'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-units'] });
    },
  });
}
