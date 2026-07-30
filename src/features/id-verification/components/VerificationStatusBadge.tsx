import { Badge } from '@/components/ui/badge';

const VARIANTS: Record<string, 'success' | 'warning' | 'destructive'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'destructive',
};

export function VerificationStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? 'secondary'} className="capitalize">
      {status}
    </Badge>
  );
}
