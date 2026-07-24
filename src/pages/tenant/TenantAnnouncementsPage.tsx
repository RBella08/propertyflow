import { Megaphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantAnnouncements } from '@/features/announcements/hooks/useAnnouncements';

export function TenantAnnouncementsPage() {
  const { data: announcements, isLoading } = useTenantAnnouncements();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Announcements</h1>
        <p className="text-muted-foreground">Messages from your landlord or estate manager.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : announcements && announcements.length > 0 ? (
        <div className="flex flex-col gap-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{a.title}</p>
                  {a.propertyName && (
                    <p className="text-caption text-muted-foreground">{a.propertyName}</p>
                  )}
                  <p className="mt-1 text-small text-muted-foreground">{a.body}</p>
                  <p className="mt-1 text-caption text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No announcements yet.</p>
      )}
    </div>
  );
}
