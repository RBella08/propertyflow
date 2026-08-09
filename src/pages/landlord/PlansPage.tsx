import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';
import { openPaystackCheckout } from '@/lib/paystack';

const DURATION_FILTERS = ['all', 1, 2, 3, 6, 12] as const;

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PlansPage() {
  const { profile } = useAuthContext();
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [durationFilter, setDurationFilter] = useState<(typeof DURATION_FILTERS)[number]>('all');

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscription_plans').select('*').order('price');
      if (error) throw error;
      return data;
    },
  });

  const { data: myPlanId, refetch: refetchMyPlan } = useQuery({
    queryKey: ['my-plan-id', profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('landlords')
        .select('plan_id')
        .eq('profile_id', profile!.id)
        .single();
      return data?.plan_id ?? null;
    },
    enabled: !!profile?.id,
  });

  const filteredPlans = plans?.filter((p) => {
    if (p.price === 0) return true; // Free always shown
    return durationFilter === 'all' || p.duration_months === durationFilter;
  });

  const handleSubscribe = async (planId: string, price: number, name: string) => {
    if (price === 0) return;
    setSubscribing(planId);
    try {
      await openPaystackCheckout({
        email: profile!.email,
        amountNaira: price,
        subaccountCode: null,
        metadata: { landlord_profile_id: profile!.id, plan_id: planId },
        onSuccess: async (reference) => {
          const { data, error } = await supabase.functions.invoke('verify-plan-payment', {
            body: { reference },
          });
          if (error || !data?.success) {
            toast.error('Could not verify payment', {
              description: data?.message ?? 'Please contact support.',
            });
            setSubscribing(null);
            return;
          }
          await refetchMyPlan();
          toast.success(`Upgraded to ${name}!`);
          setSubscribing(null);
        },
        onClose: () => setSubscribing(null),
      });
    } catch {
      toast.error('Could not start checkout');
      setSubscribing(null);
    }
  };

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Plans</h1>
        <p className="text-muted-foreground">
          Choose the plan that fits the size of your portfolio.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {DURATION_FILTERS.map((d) => (
          <Button
            key={d}
            size="sm"
            variant={durationFilter === d ? 'default' : 'outline'}
            onClick={() => setDurationFilter(d)}
          >
            {d === 'all' ? 'All' : `${d} Month${d > 1 ? 's' : ''}`}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlans?.map((plan) => (
          <Card key={plan.id} className={myPlanId === plan.id ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-h6">{plan.name}</CardTitle>
                {myPlanId === plan.id && <Badge variant="success">Current</Badge>}
              </div>
              <p className="text-h5 font-bold text-foreground">
                {plan.price === 0 ? 'Free' : formatNaira(plan.price)}
                {plan.price > 0 && (
                  <span className="text-small font-normal text-muted-foreground">
                    {' '}
                    / {plan.duration_months} mo
                  </span>
                )}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="flex flex-col gap-2 text-small text-muted-foreground">
                {plan.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan.id, plan.price, plan.name)}
                disabled={myPlanId === plan.id || plan.price === 0}
                loading={subscribing === plan.id}
                className="w-full"
              >
                {myPlanId === plan.id ? 'Current Plan' : plan.price === 0 ? 'Free Tier' : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
