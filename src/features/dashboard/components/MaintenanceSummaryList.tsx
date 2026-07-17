import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MaintenanceSummaryItem } from '../services/tenantDashboardService';

const statusVariant: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  submitted: 'warning',
  assigned: 'warning',
  in_progress: 'warning',
  completed: 'success',
  closed: 'secondary',
};

interface MaintenanceSummaryListProps {
  requests: MaintenanceSummaryItem[];
}

export function MaintenanceSummaryList({ requests }: MaintenanceSummaryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h6">Maintenance Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-muted-foreground">No maintenance requests yet.</p>
        ) : (
          <div className="flex flex-col divide-y">
            {requests.map((request) => (
              <Link
                key={request.id}
                to={`/tenant/maintenance/${request.id}`}
                className="flex items-center justify-between py-3 hover:opacity-80"
              >
                <span className="text-small font-medium text-foreground">{request.subject}</span>
                <Badge
                  variant={statusVariant[request.status ?? ''] ?? 'secondary'}
                  className="capitalize"
                >
                  {request.status?.replace('_', ' ') ?? 'Unknown'}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
