import { Skeleton } from '@/components/ui/skeleton';
import { ChatThread } from '@/features/messaging/components/ChatThread';
import { useTenantConversation } from '@/features/messaging/hooks/useMessaging';

export function MessagesPage() {
  const { data: conversation, isLoading } = useTenantConversation();

  if (isLoading) return <Skeleton className="h-96" />;

  if (!conversation) {
    return <p className="text-muted-foreground">No active lease to message about.</p>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Messages</h1>
        <p className="text-muted-foreground">
          {conversation.otherPersonName} — {conversation.propertyName}
        </p>
      </div>
      <ChatThread
        leaseId={conversation.leaseId}
        recipientProfileId={conversation.otherPersonProfileId}
        otherPersonName={conversation.otherPersonName}
      />
      {/* recipientProfileId is resolved server-side inside getTenantConversation
          but not returned directly — see note below the code block */}
    </div>
  );
}
