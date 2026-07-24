import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVendors,
  createVendor,
  deleteVendor,
  assignVendorToRequest,
} from '../services/vendorService';
import type { VendorFormInput } from '../schemas';
import { useAuthContext } from '@/providers/AuthProvider';

export function useVendors() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['vendors', profile?.id],
    queryFn: () => getVendors(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useCreateVendor() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VendorFormInput) => createVendor(profile!.id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vendorId: string) => deleteVendor(vendorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });
}

export function useAssignVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, vendorId }: { requestId: string; vendorId: string }) =>
      assignVendorToRequest(requestId, vendorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landlord-maintenance'] }),
  });
}
