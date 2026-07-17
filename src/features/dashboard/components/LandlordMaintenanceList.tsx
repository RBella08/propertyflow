import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LandlordMaintenanceItem } from '../services/landlordDashboardService';

const statusVariant: Record<string, 'success' | 'warning' | 'secondary'> = {
  submitted: 'warning',
  assigned: 'warning',
  in_progress: 'warning',
  completed: 'success',
  closed: 'secondary',
};

interface LandlordMaintenanceListProps {
  requests: LandlordMaintenanceItem[];
}

export function LandlordMaintenanceList({ requests }: LandlordMaintenanceListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h6">Recent Maintenance</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-muted-foreground">No maintenance requests yet.</p>
        ) : (
          <div className="flex flex-col divide-y">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-small font-medium text-foreground">{r.subject}</p>
                  <p className="text-caption capitalize text-muted-foreground">
                    {r.priority} priority
                  </p>
                </div>
                <Badge
                  variant={statusVariant[r.status ?? ''] ?? 'secondary'}
                  className="capitalize"
                >
                  {r.status?.replace('_', ' ') ?? 'Unknown'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
