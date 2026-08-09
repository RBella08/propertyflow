import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';

export function useMyPlan() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['my-plan-tier', profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('landlords')
        .select('subscription_plans(tier_name)')
        .eq('profile_id', profile!.id)
        .single();
      return (data as any)?.subscription_plans?.tier_name ?? 'Free';
    },
    enabled: !!profile?.id,
  });
}
