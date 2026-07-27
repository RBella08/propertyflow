import { useQuery } from '@tanstack/react-query';
import {
  getLandlordCalendarEvents,
  getManagerCalendarEvents,
  getTenantCalendarEvents,
} from '../services/calendarService';
import { getTenantId } from '@/features/payments/services/paymentService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useLandlordCalendarEvents() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['landlord-calendar', profile?.id],
    queryFn: () => getLandlordCalendarEvents(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useManagerCalendarEvents() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['manager-calendar', profile?.id],
    queryFn: () => getManagerCalendarEvents(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useTenantCalendarEvents() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['tenant-calendar', profile?.id],
    queryFn: async () => getTenantCalendarEvents(await getTenantId(profile!.id)),
    enabled: !!profile?.id,
  });
}
