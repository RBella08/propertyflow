import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'destructive';
  /** Optional muted supporting line under the value (e.g. "vs last month"). */
  subtitle?: string;
}

const toneStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  tone = 'default',
  subtitle,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-md',
            toneStyles[tone]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-small font-medium text-muted-foreground">{title}</p>
          <p className="text-h5 font-semibold tabular-nums text-foreground">{value}</p>
          {subtitle && <p className="text-caption text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
