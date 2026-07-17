import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'destructive';
}

const toneStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatsCard({ title, value, icon: Icon, tone = 'default' }: StatsCardProps) {
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
        <div>
          <p className="text-small text-muted-foreground">{title}</p>
          <p className="text-h5 font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
