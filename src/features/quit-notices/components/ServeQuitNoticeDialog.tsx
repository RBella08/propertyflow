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
import { quitNoticeSchema, type QuitNoticeFormInput } from '../schemas';
import { useServeQuitNotice } from '../hooks/useQuitNotices';

interface ServeQuitNoticeDialogProps {
  open: boolean;
  onClose: () => void;
  leaseId: string;
  tenantProfileId: string;
  tenantName: string;
  propertyName: string;
}

export function ServeQuitNoticeDialog({
  open,
  onClose,
  leaseId,
  tenantProfileId,
  tenantName,
  propertyName,
}: ServeQuitNoticeDialogProps) {
  const serveNotice = useServeQuitNotice();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuitNoticeFormInput>({ resolver: zodResolver(quitNoticeSchema) });

  const onSubmit = async (data: QuitNoticeFormInput) => {
    try {
      await serveNotice.mutateAsync({ leaseId, tenantProfileId, propertyName, input: data });
      toast.success('Notice to Quit served', { description: `${tenantName} has been notified.` });
      reset();
      onClose();
    } catch {
      toast.error('Could not serve notice');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Serve Notice to Quit</DialogTitle>
          <DialogDescription>
            This formally notifies {tenantName} to vacate {propertyName} by a specific date.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="vacateBy">Vacate By</Label>
            <Input id="vacateBy" type="date" {...register('vacateBy')} error={!!errors.vacateBy} />
            {errors.vacateBy && (
              <p className="text-caption text-destructive">{errors.vacateBy.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" rows={3} {...register('reason')} error={!!errors.reason} />
            {errors.reason && (
              <p className="text-caption text-destructive">{errors.reason.message}</p>
            )}
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full" variant="destructive">
            Serve Notice
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
