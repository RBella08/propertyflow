import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-destructive' };
  if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-warning' };
  if (score <= 4) return { score: 3, label: 'Good', color: 'bg-info' };
  return { score: 4, label: 'Strong', color: 'bg-success' };
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={cn('h-1.5 flex-1 rounded-full bg-muted', bar <= score && color)}
          />
        ))}
      </div>
      <p className="text-caption text-muted-foreground">{label}</p>
    </div>
  );
}
