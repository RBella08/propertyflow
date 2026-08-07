import { useEffect, useRef, useState } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';
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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(
      (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    setSelectedImages((prev) => [...prev, ...valid]);
    setPreviewUrls((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!body.trim() && selectedImages.length === 0) return;
    sendMessage.mutate(
      {
        leaseId,
        recipientProfileId: counterpartProfileId,
        body: body.trim(),
        imageFiles: selectedImages,
      },
      {
        onSuccess: () => {
          setBody('');
          previewUrls.forEach((url) => URL.revokeObjectURL(url));
          setSelectedImages([]);
          setPreviewUrls([]);
        },
      }
    );
  };

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-[500px] flex-col gap-3 overflow-y-auto rounded-card border p-4">
        {messages && messages.length > 0 ? (
          messages.map((m) => {
            const isMine = m.senderProfileId === profile?.id;
            const images = m.imageUrl ? m.imageUrl.split(',') : [];
            return (
              <div key={m.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'flex max-w-[75%] flex-col gap-1 rounded-2xl px-4 py-2 text-small',
                    isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  )}
                >
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-1">
                      {images.map((url, i) => (
                        <img key={i} src={url} alt="" className="rounded-md object-cover" />
                      ))}
                    </div>
                  )}
                  {m.body && <p>{m.body}</p>}
                  <p
                    className={cn(
                      'text-caption',
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

      {previewUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-md border p-2">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt="" className="h-16 w-16 rounded-md object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center self-end rounded-md border hover:bg-accent">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleImageSelect(e.target.files)}
          />
        </label>
        <Textarea
          rows={2}
          placeholder="Type a message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button onClick={handleSend} loading={sendMessage.isPending} className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
