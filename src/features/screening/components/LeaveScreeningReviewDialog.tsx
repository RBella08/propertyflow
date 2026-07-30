import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { screeningReviewSchema, type ScreeningReviewFormInput } from '../schemas';
import { useSubmitScreeningReview } from '../hooks/useScreening';

const RATING_OPTIONS = ['excellent', 'good', 'fair', 'poor'];

interface LeaveScreeningReviewDialogProps {
  open: boolean;
  onClose: () => void;
  tenantProfileId: string;
  leaseId: string;
  tenantName: string;
}

export function LeaveScreeningReviewDialog({
  open,
  onClose,
  tenantProfileId,
  leaseId,
  tenantName,
}: LeaveScreeningReviewDialogProps) {
  const submitReview = useSubmitScreeningReview();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ScreeningReviewFormInput>({
    resolver: zodResolver(screeningReviewSchema),
    defaultValues: { paymentReliability: 'good', propertyCare: 'good', wouldRentAgain: 'yes' },
  });

  const onSubmit = async (data: ScreeningReviewFormInput) => {
    try {
      await submitReview.mutateAsync({ tenantProfileId, leaseId, input: data });
      toast.success('Review submitted', {
        description: 'This helps other landlords on the platform.',
      });
      reset();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String((error as any)?.message ?? '');
      toast.error('Could not submit review', {
        description: message.includes('duplicate')
          ? "You've already reviewed this tenant for this lease."
          : 'Something went wrong',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review — {tenantName}</DialogTitle>
          <DialogDescription>
            Shown anonymously to future landlords on the platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="paymentReliability">Payment Reliability</Label>
            <select
              id="paymentReliability"
              {...register('paymentReliability')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
            >
              {RATING_OPTIONS.map((o) => (
                <option key={o} value={o} className="capitalize">
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="propertyCare">Property Care</Label>
            <select
              id="propertyCare"
              {...register('propertyCare')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
            >
              {RATING_OPTIONS.map((o) => (
                <option key={o} value={o} className="capitalize">
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="wouldRentAgain">Would you rent to them again?</Label>
            <select
              id="wouldRentAgain"
              {...register('wouldRentAgain')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="comments">Comments (optional)</Label>
            <Textarea id="comments" rows={3} {...register('comments')} />
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full">
            Submit Review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
