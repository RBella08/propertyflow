import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAnnouncement,
  getPropertyAnnouncements,
  getTenantAnnouncements,
} from '../services/announcementService';
import type { AnnouncementFormInput } from '../schemas';
import { getTenantId } from '@/features/payments/services/paymentService';
import { useAuthContext } from '@/providers/AuthProvider';

export function usePropertyAnnouncements(propertyId: string) {
  return useQuery({
    queryKey: ['property-announcements', propertyId],
    queryFn: () => getPropertyAnnouncements(propertyId),
    enabled: !!propertyId,
  });
}

export function useCreateAnnouncement() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, input }: { propertyId: string; input: AnnouncementFormInput }) =>
      createAnnouncement(propertyId, profile!.id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-announcements', variables.propertyId] });
    },
  });
}

export function useTenantAnnouncements() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['tenant-announcements', profile?.id],
    queryFn: async () => getTenantAnnouncements(await getTenantId(profile!.id)),
    enabled: !!profile?.id,
  });
}
