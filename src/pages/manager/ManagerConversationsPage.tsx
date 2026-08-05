import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatThread } from '@/features/messaging/components/ChatThread';
import { useManagerConversations } from '@/features/messaging/hooks/useMessaging';

export function ManagerConversationsPage() {
  const { data: conversations, isLoading } = useManagerConversations();
  const [activeLeaseId, setActiveLeaseId] = useState<string | null>(null);

  const active = conversations?.find((c) => c.leaseId === activeLeaseId);

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Messages</h1>
        <p className="text-muted-foreground">Direct conversations with your tenants.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-2 lg:col-span-1">
          {conversations && conversations.length > 0 ? (
            conversations.map((c) => (
              <Card
                key={c.leaseId}
                className={`cursor-pointer transition-colors hover:bg-accent ${activeLeaseId === c.leaseId ? 'border-primary' : ''}`}
                onClick={() => setActiveLeaseId(c.leaseId)}
              >
                <CardContent className="flex items-center justify-between gap-2 p-3">
                  <div>
                    <p className="text-small font-medium text-foreground">{c.otherPersonName}</p>
                    <p className="text-caption text-muted-foreground">{c.propertyName}</p>
                    {c.lastMessage && (
                      <p className="truncate text-caption text-muted-foreground">{c.lastMessage}</p>
                    )}
                  </div>
                  {c.unreadCount > 0 && <Badge variant="destructive">{c.unreadCount}</Badge>}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-small text-muted-foreground">No conversations yet.</p>
          )}
        </div>

        <div className="lg:col-span-2">
          {active ? (
            <ChatThread
              leaseId={active.leaseId}
              recipientProfileId={active.otherPersonProfileId}
              otherPersonName={active.otherPersonName}
            />
          ) : (
            <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-card border text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
              <p className="text-small text-muted-foreground">
                Select a conversation to view messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
