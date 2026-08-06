import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/features/notifications/hooks/useNotifications';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';

export function NotificationsPage() {
  const { data: notifications, isLoading, unreadCount } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h4 text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You&apos;re all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllAsRead.mutate()}
            loading={markAllAsRead.isPending}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-16 w-full" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="flex max-h-[600px] flex-col overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-center border-b last:border-b-0">
                  <div className="flex-1">
                    <NotificationItem
                      notification={n}
                      onClick={() => !n.isRead && markAsRead.mutate(n.id)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mr-3 shrink-0 text-destructive"
                    onClick={() => deleteNotification.mutate(n.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-muted-foreground">No notifications yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
