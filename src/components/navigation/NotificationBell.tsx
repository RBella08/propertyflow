import { Link } from 'react-router';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link to="/notifications">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-caption"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </Link>
    </Button>
  );
}
