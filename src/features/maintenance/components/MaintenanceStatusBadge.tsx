import { Badge } from '@/components/ui/badge';

const variants: Record<string, 'warning' | 'success' | 'secondary'> = {
  submitted: 'warning',
  assigned: 'warning',
  in_progress: 'warning',
  completed: 'success',
  closed: 'secondary',
};

export function MaintenanceStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variants[status] ?? 'secondary'} className="capitalize">
      {status.replace('_', ' ')}
    </Badge>
  );
}
