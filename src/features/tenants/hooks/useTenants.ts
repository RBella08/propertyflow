import { useQuery } from '@tanstack/react-query';
import { getLandlordTenants, getManagerTenants } from '../services/tenantsService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useLandlordTenants() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['landlord-tenants', profile?.id],
    queryFn: () => getLandlordTenants(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useManagerTenants() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['manager-tenants', profile?.id],
    queryFn: () => getManagerTenants(profile!.id),
    enabled: !!profile?.id,
  });
}
