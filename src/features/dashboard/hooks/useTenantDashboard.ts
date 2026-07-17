import { useQuery } from '@tanstack/react-query';
import { getTenantDashboardData } from '../services/tenantDashboardService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useTenantDashboard() {
  const { profile } = useAuthContext();

  return useQuery({
    queryKey: ['tenant-dashboard', profile?.id],
    queryFn: () => getTenantDashboardData(profile!.id),
    enabled: !!profile?.id,
  });
}
