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

const DURATION_OPTIONS = [1, 2, 3, 6, 12] as const;

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
  const [selectedDuration, setSelectedDuration] = useState<(typeof DURATION_OPTIONS)[number]>(1);

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

  const freePlan = plans?.find((p) => p.price === 0);
  const paidPlansForDuration = plans?.filter(
    (p) => p.price > 0 && p.duration_months === selectedDuration
  );

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
              description: data?.message ?? 'Please contact support with your payment reference.',
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

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Plans</h1>
        <p className="text-muted-foreground">
          Choose the plan that fits the size of your portfolio.
        </p>
      </div>

      <div>
        <p className="mb-2 text-small font-medium text-foreground">Select a billing period:</p>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((months) => (
            <Button
              key={months}
              size="sm"
              variant={selectedDuration === months ? 'default' : 'outline'}
              onClick={() => setSelectedDuration(months)}
            >
              {months} Month{months > 1 ? 's' : ''}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {freePlan && (
          <Card className={myPlanId === freePlan.id ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-h6">{freePlan.name}</CardTitle>
                {myPlanId === freePlan.id && <Badge variant="success">Current</Badge>}
              </div>
              <p className="text-h5 font-bold text-foreground">Free</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="flex flex-col gap-2 text-small text-muted-foreground">
                {freePlan.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Button disabled className="w-full">
                {myPlanId === freePlan.id ? 'Current Plan' : 'Free Tier'}
              </Button>
            </CardContent>
          </Card>
        )}

        {paidPlansForDuration?.map((plan) => (
          <Card key={plan.id} className={myPlanId === plan.id ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-h6">{plan.tier_name}</CardTitle>
                {myPlanId === plan.id && <Badge variant="success">Current</Badge>}
              </div>
              <p className="text-h5 font-bold text-foreground">
                {formatNaira(plan.price)}
                <span className="text-small font-normal text-muted-foreground">
                  {' '}
                  / {plan.duration_months} mo
                </span>
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
                disabled={myPlanId === plan.id}
                loading={subscribing === plan.id}
                className="w-full"
              >
                {myPlanId === plan.id ? 'Current Plan' : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
