import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGES = ['submitted', 'assigned', 'in_progress', 'completed', 'closed'];
const LABELS: Record<string, string> = {
  submitted: 'Submitted',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  closed: 'Closed',
};

export function MaintenanceStatusTimeline({ status }: { status: string }) {
  const currentIndex = STAGES.indexOf(status);

  return (
    <div className="flex items-center">
      {STAGES.map((stage, index) => (
        <div key={stage} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 text-caption font-semibold',
                index <= currentIndex
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background text-muted-foreground'
              )}
            >
              {index < currentIndex ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span className="text-caption text-muted-foreground">{LABELS[stage]}</span>
          </div>
          {index < STAGES.length - 1 && (
            <div
              className={cn('mx-2 h-0.5 flex-1', index < currentIndex ? 'bg-primary' : 'bg-input')}
            />
          )}
        </div>
      ))}
    </div>
  );
}
