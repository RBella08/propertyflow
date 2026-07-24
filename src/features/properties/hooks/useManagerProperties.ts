import { useQuery } from '@tanstack/react-query';
import {
  getManagerProperties,
  getManagerDashboardData,
} from '../services/propertyManagementService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useManagerProperties() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['manager-properties', profile?.id],
    queryFn: () => getManagerProperties(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useManagerDashboard() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['manager-dashboard', profile?.id],
    queryFn: () => getManagerDashboardData(profile!.id),
    enabled: !!profile?.id,
  });
}
