import { Badge } from '@/components/ui/badge';

const variants: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  available: 'success',
  occupied: 'secondary',
  reserved: 'warning',
  maintenance: 'destructive',
};

export function UnitStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variants[status] ?? 'secondary'} className="capitalize">
      {status}
    </Badge>
  );
}
