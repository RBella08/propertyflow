import { useQuery } from '@tanstack/react-query';
import { getLandlordDashboardData } from '../services/landlordDashboardService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useLandlordDashboard() {
  const { profile } = useAuthContext();

  return useQuery({
    queryKey: ['landlord-dashboard', profile?.id],
    queryFn: () => getLandlordDashboardData(profile!.id),
    enabled: !!profile?.id,
  });
}
