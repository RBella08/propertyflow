import { useQuery } from '@tanstack/react-query';
import { getLandlordLeases, getAvailableUnitOptions } from '../services/leaseService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useLandlordLeases() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['landlord-leases', profile?.id],
    queryFn: () => getLandlordLeases(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useAvailableUnitOptions() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['available-units', profile?.id],
    queryFn: () => getAvailableUnitOptions(profile!.id),
    enabled: !!profile?.id,
  });
}
