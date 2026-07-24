import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { announcementSchema, type AnnouncementFormInput } from '../schemas';
import { useCreateAnnouncement } from '../hooks/useAnnouncements';

interface AnnouncementDialogProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
}

export function AnnouncementDialog({
  open,
  onClose,
  propertyId,
  propertyName,
}: AnnouncementDialogProps) {
  const createAnnouncement = useCreateAnnouncement();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormInput>({ resolver: zodResolver(announcementSchema) });

  const onSubmit = async (data: AnnouncementFormInput) => {
    try {
      await createAnnouncement.mutateAsync({ propertyId, input: data });
      toast.success('Announcement sent', {
        description: 'All tenants of this property have been notified.',
      });
      reset();
      onClose();
    } catch {
      toast.error('Could not send announcement');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post Announcement</DialogTitle>
          <DialogDescription>
            Sent to every tenant currently leasing at &quot;{propertyName}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="announcementTitle">Title</Label>
            <Input id="announcementTitle" {...register('title')} error={!!errors.title} />
            {errors.title && (
              <p className="text-caption text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="announcementBody">Message</Label>
            <Textarea id="announcementBody" rows={4} {...register('body')} error={!!errors.body} />
            {errors.body && <p className="text-caption text-destructive">{errors.body.message}</p>}
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full">
            Send to Tenants
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
