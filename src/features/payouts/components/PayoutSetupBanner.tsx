import { Link } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMyPayoutInfo } from '../hooks/usePayouts';

export function PayoutSetupBanner() {
  const { data: payoutInfo, isLoading, isError } = useMyPayoutInfo();

  // Still checking, or a real error occurred (not "not configured yet") —
  // stay silent rather than flash a confusing banner in either case.
  if (isLoading) return null;
  if (payoutInfo?.subaccountCode) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-warning/40 bg-warning/10 p-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
        <p className="text-small text-foreground">
          <strong>Set up your payout details</strong> to start receiving rent payments directly to
          your bank account.
        </p>
      </div>
      <Button size="sm" asChild>
        <Link to="/landlord/payout-settings">Set Up Now</Link>
      </Button>
      {isError && (
        <p className="w-full text-caption text-muted-foreground">
          (We couldn&apos;t confirm your current status — click above to check.)
        </p>
      )}
    </div>
  );
}
