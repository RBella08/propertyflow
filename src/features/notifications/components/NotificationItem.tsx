import { Bell, CreditCard, Wrench, FileText, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationItem as NotificationItemType } from '../services/notificationService';

const ICONS: Record<string, typeof Bell> = {
  payment_success: CreditCard,
  payment_failed: CreditCard,
  rent_reminder: CreditCard,
  maintenance_update: Wrench,
  lease_expiry: FileText,
  invoice_created: FileText,
  announcement: Megaphone,
  welcome: Bell,
};

interface NotificationItemProps {
  notification: NotificationItemType;
  onClick: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = ICONS[notification.type] ?? Bell;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 border-b p-4 text-left transition-colors hover:bg-accent',
        !notification.isRead && 'bg-primary/5'
      )}
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-small font-medium text-foreground">{notification.title}</p>
          {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
        </div>
        <p className="text-small text-muted-foreground">{notification.message}</p>
        <p className="mt-1 text-caption text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </button>
  );
}
