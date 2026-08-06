import { useEffect, useRef, useState } from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLeaseMessages, useSendMessage } from '../hooks/useMessaging';
import { useAuthContext } from '@/providers/AuthProvider';

interface ChatThreadProps {
  leaseId: string;
  counterpartProfileId: string;
  otherPersonName: string;
}

export function ChatThread({ leaseId, counterpartProfileId, otherPersonName }: ChatThreadProps) {
  const { profile } = useAuthContext();
  const { data: messages, isLoading } = useLeaseMessages(leaseId, counterpartProfileId);
  const sendMessage = useSendMessage();

  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!body.trim() && !imageFile) return;

    sendMessage.mutate(
      {
        leaseId,
        recipientProfileId: counterpartProfileId,
        body: body.trim(),
        imageFile,
      },
      {
        onSuccess: () => {
          setBody('');
          setImageFile(null);
        },
      }
    );
  };

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-[500px] flex-col gap-3 overflow-y-auto rounded-card border p-4">
        {messages && messages.length > 0 ? (
          messages.map((m) => {
            const isMine = m.senderProfileId === profile?.id;

            return (
              <div key={m.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2 text-small',
                    isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  )}
                >
                  <p>{m.body}</p>

                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt="Message attachment"
                      className="mt-1 max-w-full rounded-md"
                    />
                  )}

                  <p
                    className={cn(
                      'mt-1 text-caption',
                      isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="m-auto text-small text-muted-foreground">
            No messages yet — say hello to {otherPersonName}.
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <Textarea
          rows={2}
          placeholder="Type a message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <Button type="button" variant="outline" className="self-end" asChild>
          <label>
            <ImageIcon className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </Button>

        <Button onClick={handleSend} loading={sendMessage.isPending} className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
