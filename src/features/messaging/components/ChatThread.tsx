import { useEffect, useRef, useState } from 'react';
import { Send, Image as ImageIcon, X, Trash2, Pencil, Check, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  useLeaseMessages,
  useSendMessage,
  useTypingIndicator,
  useDeleteMessageForMe,
  useDeleteMessageForEveryone,
  useEditMessage,
} from '../hooks/useMessaging';
import { VoiceRecorder } from './VoiceRecorder';
import { VideoPicker } from './VideoPicker';
import { useMyPlan } from '@/features/plans/hooks/useMyPlan';
import { hasFeatureAccess, FEATURE_MIN_TIER } from '@/features/plans/planFeatures';
import { useAuthContext } from '@/providers/AuthProvider';

const EDIT_WINDOW_MS = 20 * 60 * 1000;

interface ChatThreadProps {
  leaseId: string;
  counterpartProfileId: string;
  otherPersonName: string;
}

export function ChatThread({ leaseId, counterpartProfileId, otherPersonName }: ChatThreadProps) {
  const { profile } = useAuthContext();
  const { data: messages, isLoading } = useLeaseMessages(leaseId, counterpartProfileId);
  const sendMessage = useSendMessage();
  const deleteForMe = useDeleteMessageForMe();
  const deleteForEveryone = useDeleteMessageForEveryone();
  const editMessage = useEditMessage();
  const { otherIsTyping, broadcastTyping } = useTypingIndicator(leaseId, profile?.id);

  const [body, setBody] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { data: myTier } = useMyPlan();
  const canSendVideo = hasFeatureAccess(myTier ?? 'Free', 'chatVideo');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; isMine: boolean } | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; body: string } | null>(null);
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
    if (!body.trim() && selectedImages.length === 0 && !videoFile) return;
    sendMessage.mutate(
      {
        leaseId,
        recipientProfileId: counterpartProfileId,
        body: body.trim(),
        imageFiles: selectedImages,
        videoFile: videoFile ?? undefined,
      },
      {
        onSuccess: () => {
          setBody('');
          previewUrls.forEach((url) => URL.revokeObjectURL(url));
          setSelectedImages([]);
          setPreviewUrls([]);
          setVideoFile(null);
        },
      }
    );
  };

  const handleSendVoice = (audioBlob: Blob) => {
    sendMessage.mutate({ leaseId, recipientProfileId: counterpartProfileId, body: '', audioBlob });
  };

  const handleDeleteForMe = () => {
    if (!deleteTarget) return;
    deleteForMe.mutate({ messageId: deleteTarget.id, iAmSender: deleteTarget.isMine });
    setDeleteTarget(null);
  };

  const handleDeleteForEveryone = () => {
    if (!deleteTarget) return;
    deleteForEveryone.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    editMessage.mutate({ messageId: editTarget.id, newBody: editTarget.body });
    setEditTarget(null);
  };

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex h-[55vh] max-h-[500px] min-h-[300px] min-w-0 flex-col gap-3 overflow-y-auto rounded-card border-2 p-4">
        {messages && messages.length > 0 ? (
          messages.map((m) => {
            const isMine = m.senderProfileId === profile?.id;
            const images = m.imageUrl ? m.imageUrl.split(',') : [];
            const canEdit =
              isMine &&
              !m.deletedForEveryone &&
              Date.now() - new Date(m.createdAt).getTime() < EDIT_WINDOW_MS &&
              !m.audioUrl &&
              images.length === 0;

            return (
              <div
                key={m.id}
                className={cn('flex min-w-0', isMine ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'group flex max-w-[75%] min-w-0 flex-col gap-1 rounded-2xl px-4 py-2 text-small',
                    isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  )}
                >
                  {m.deletedForEveryone ? (
                    <p className="italic opacity-70">
                      {isMine ? 'You deleted this message' : 'This message was deleted'}
                    </p>
                  ) : (
                    <>
                      {images.length > 0 && (
                        <div className="grid grid-cols-2 gap-1">
                          {images.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt=""
                              className="max-w-full rounded-md object-cover"
                            />
                          ))}
                        </div>
                      )}
                      {m.audioUrl && (
                        <audio src={m.audioUrl} controls className="h-8 max-w-full">
                          {' '}
                          <track kind="captions" />{' '}
                        </audio>
                      )}
                      {m.videoUrl && (
                        <video
                          src={m.videoUrl}
                          controls
                          className="max-w-full rounded-md"
                          style={{ maxHeight: '240px' }}
                        >
                          <track kind="captions" />
                        </video>
                      )}
                      {m.body && <p className="break-words">{m.body}</p>}
                    </>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'text-caption',
                        isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}
                    >
                      {new Date(m.createdAt).toLocaleString()}
                      {m.editedAt && ' (edited)'}
                    </p>
                    {isMine && !m.deletedForEveryone && (
                      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {canEdit && (
                          <button
                            onClick={() => setEditTarget({ id: m.id, body: m.body })}
                            className="text-primary-foreground/70 hover:text-primary-foreground"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget({ id: m.id, isMine })}
                          className="text-primary-foreground/70 hover:text-primary-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {!isMine && !m.deletedForEveryone && (
                      <button
                        onClick={() => setDeleteTarget({ id: m.id, isMine: false })}
                        className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="m-auto text-small text-muted-foreground">
            No messages yet — say hello to {otherPersonName}.
          </p>
        )}
        {otherIsTyping && (
          <p className="text-caption italic text-muted-foreground">
            {otherPersonName} is typing...
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

      <div className="flex min-w-0 flex-wrap gap-2">
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
        <VoiceRecorder onSend={handleSendVoice} />
        {canSendVideo ? (
          <VideoPicker onSelect={setVideoFile} />
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 self-end opacity-50"
            title={`Video messages require the ${FEATURE_MIN_TIER.chatVideo} plan or higher`}
            onClick={() =>
              toast.info(`Upgrade to ${FEATURE_MIN_TIER.chatVideo} to send video messages`)
            }
          >
            <Lock className="h-4 w-4" />
          </Button>
        )}
        <Textarea
          rows={2}
          placeholder="Type a message..."
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            broadcastTyping();
          }}
          className="min-w-0 flex-1"
        />
        <Button onClick={handleSend} loading={sendMessage.isPending} className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete message</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button variant="outline" className="w-full" onClick={handleDeleteForMe}>
              Delete for Me
            </Button>
            {deleteTarget?.isMine && (
              <Button variant="destructive" className="w-full" onClick={handleDeleteForEveryone}>
                Delete for Everyone
              </Button>
            )}
            <Button variant="ghost" className="w-full" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit message</DialogTitle>
          </DialogHeader>
          <Input
            value={editTarget?.body ?? ''}
            onChange={(e) =>
              setEditTarget((prev) => (prev ? { ...prev, body: e.target.value } : prev))
            }
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Check className="mr-1.5 h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
