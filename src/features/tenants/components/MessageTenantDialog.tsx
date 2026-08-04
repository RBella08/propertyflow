import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

interface MessageTenantDialogProps {
  open: boolean;
  onClose: () => void;
  tenantProfileId: string;
  tenantName: string;
}

export function MessageTenantDialog({
  open,
  onClose,
  tenantProfileId,
  tenantName,
}: MessageTenantDialogProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Write a message first');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: tenantProfileId,
        title: 'New message from your landlord',
        message: message.trim(),
        type: 'announcement',
      });
      if (error) throw error;
      toast.success('Message sent', { description: `${tenantName} has been notified.` });
      setMessage('');
      onClose();
    } catch {
      toast.error('Could not send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message {tenantName}</DialogTitle>
          <DialogDescription>Sent privately, only to this tenant.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="privateMessage">Message</Label>
            <Textarea
              id="privateMessage"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button onClick={handleSend} loading={sending}>
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
