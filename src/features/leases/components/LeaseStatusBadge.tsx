import { Badge } from '@/components/ui/badge';

const variants: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  active: 'success',
  pending: 'warning',
  renewed: 'success',
  expired: 'secondary',
  terminated: 'destructive',
};

export function LeaseStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variants[status] ?? 'secondary'} className="capitalize">
      {status}
    </Badge>
  );
}
