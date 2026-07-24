import { useQuery } from '@tanstack/react-query';
import { getTenantLeases } from '../services/tenantLeaseService';
import { getTenantId } from '@/features/payments/services/paymentService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useTenantLeases() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['tenant-leases', profile?.id],
    queryFn: async () => getTenantLeases(await getTenantId(profile!.id)),
    enabled: !!profile?.id,
  });
}
