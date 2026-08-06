import { BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function VerifiedBadge() {
  return (
    <Badge variant="success" className="flex w-fit items-center gap-1">
      <BadgeCheck className="h-3 w-3" /> Verified
    </Badge>
  );
}
