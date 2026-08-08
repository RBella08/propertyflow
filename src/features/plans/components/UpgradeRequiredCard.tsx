import { Link } from 'react-router';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UpgradeRequiredCardProps {
  featureName: string;
  requiredPlanName: string;
}

export function UpgradeRequiredCard({ featureName, requiredPlanName }: UpgradeRequiredCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <Lock className="h-10 w-10 text-muted-foreground" />
        <p className="text-h5 text-foreground">{featureName} requires an upgrade</p>
        <p className="max-w-sm text-small text-muted-foreground">
          This feature is available starting from the {requiredPlanName.replace(' Monthly', '')}{' '}
          plan.
        </p>
        <Button asChild>
          <Link to="/landlord/plans">View Plans</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
