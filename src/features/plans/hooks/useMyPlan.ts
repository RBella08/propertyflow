import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';

export function useMyPlan() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['my-plan-name', profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('landlords')
        .select('subscription_plans(name)')
        .eq('profile_id', profile!.id)
        .single();
      return (data as any)?.subscription_plans?.name ?? 'Free';
    },
    enabled: !!profile?.id,
  });
}
