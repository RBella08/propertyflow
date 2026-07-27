import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useScreeningSummary } from '../hooks/useScreening';

interface ScreeningHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  tenantProfileId: string;
  tenantName: string;
}

const RELIABILITY_LABEL: Record<number, string> = {
  4: 'Excellent',
  3: 'Good',
  2: 'Fair',
  1: 'Poor',
};

export function ScreeningHistoryDialog({
  open,
  onClose,
  tenantProfileId,
  tenantName,
}: ScreeningHistoryDialogProps) {
  const { data: summary, isLoading } = useScreeningSummary(open ? tenantProfileId : undefined);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rental History — {tenantName}</DialogTitle>
          <DialogDescription>Feedback from previous landlords on this platform.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-40" />
        ) : summary && summary.reviewCount > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 rounded-md border p-3 text-center">
              <div>
                <p className="text-h6 font-semibold text-foreground">
                  {summary.averagePaymentScore}/4
                </p>
                <p className="text-caption text-muted-foreground">Payment Reliability</p>
              </div>
              <div>
                <p className="text-h6 font-semibold text-foreground">
                  {summary.averagePropertyCareScore}/4
                </p>
                <p className="text-caption text-muted-foreground">Property Care</p>
              </div>
              <div>
                <p className="text-h6 font-semibold text-foreground">
                  {summary.percentWouldRentAgain}%
                </p>
                <p className="text-caption text-muted-foreground">Would Rent Again</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {summary.reviews.map((r, i) => (
                <div key={i} className="rounded-md border p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3" /> {RELIABILITY_LABEL[4]}: {r.paymentReliability}
                    </Badge>
                    {r.wouldRentAgain ? (
                      <ThumbsUp className="h-4 w-4 text-success" />
                    ) : (
                      <ThumbsDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  {r.comments && <p className="text-small text-muted-foreground">{r.comments}</p>}
                  <p className="mt-1 text-caption text-muted-foreground">
                    A previous landlord · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-small text-muted-foreground">
            No rental history on record yet for this tenant.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
