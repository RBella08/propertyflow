import { useQuery } from '@tanstack/react-query';
import {
  getTenantId,
  getTenantMaintenanceRequests,
  getMaintenanceDetail,
  getLandlordMaintenanceRequests,
  getManagerMaintenanceRequests,
} from '../services/maintenanceService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useTenantMaintenanceRequests() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['tenant-maintenance', profile?.id],
    queryFn: async () => getTenantMaintenanceRequests(await getTenantId(profile!.id)),
    enabled: !!profile?.id,
  });
}

export function useMaintenanceDetail(requestId: string | undefined) {
  return useQuery({
    queryKey: ['maintenance-detail', requestId],
    queryFn: () => getMaintenanceDetail(requestId as string),
    enabled: !!requestId,
  });
}

export function useLandlordMaintenanceRequests() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['landlord-maintenance', profile?.id],
    queryFn: () => getLandlordMaintenanceRequests(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useManagerMaintenanceRequests() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['manager-maintenance', profile?.id],
    queryFn: () => getManagerMaintenanceRequests(profile!.id),
    enabled: !!profile?.id,
  });
}
