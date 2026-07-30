import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { VerificationStatusBadge } from './VerificationStatusBadge';
import { useTenantVerifications, useReviewVerification } from '../hooks/useIdVerification';

interface ReviewDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  tenantProfileId: string;
  tenantName: string;
}

const DOCUMENT_LABELS: Record<string, string> = {
  nin_slip: 'NIN Slip',
  bvn_slip: 'BVN Slip',
  passport: 'International Passport',
  drivers_license: "Driver's License",
  voters_card: "Voter's Card",
};

export function ReviewDocumentDialog({
  open,
  onClose,
  tenantProfileId,
  tenantName,
}: ReviewDocumentDialogProps) {
  const { data: verifications, isLoading } = useTenantVerifications(
    open ? tenantProfileId : undefined
  );
  const reviewVerification = useReviewVerification();
  const [note, setNote] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleReview = async (verificationId: string, status: 'approved' | 'rejected') => {
    setActiveId(verificationId);
    try {
      await reviewVerification.mutateAsync({ verificationId, tenantProfileId, status, note });
      toast.success(status === 'approved' ? 'Document approved' : 'Document rejected');
      setNote('');
    } catch {
      toast.error('Could not update this document');
    } finally {
      setActiveId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ID Documents — {tenantName}</DialogTitle>
          <DialogDescription>Review submitted identification documents.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-48" />
        ) : verifications && verifications.length > 0 ? (
          <div className="flex max-h-[400px] flex-col gap-4 overflow-y-auto">
            {verifications.map((v) => (
              <div key={v.id} className="flex flex-col gap-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-small font-medium text-foreground">
                    {DOCUMENT_LABELS[v.documentType]}
                  </p>
                  <VerificationStatusBadge status={v.status} />
                </div>
                {v.signedUrl && (
                  <a
                    href={v.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-caption text-primary hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" /> View document
                  </a>
                )}
                <p className="text-caption text-muted-foreground">
                  Submitted {new Date(v.submittedAt).toLocaleDateString()}
                </p>
                {v.status === 'pending' && (
                  <>
                    <Label htmlFor="review-note">Review Note</Label>

                    <Textarea
                      id="review-note"
                      placeholder="Optional note (required if rejecting)"
                      rows={2}
                      value={activeId === v.id ? note : ''}
                      onChange={(e) => {
                        setActiveId(v.id);
                        setNote(e.target.value);
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReview(v.id, 'approved')}
                        loading={reviewVerification.isPending && activeId === v.id}
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReview(v.id, 'rejected')}
                        loading={reviewVerification.isPending && activeId === v.id}
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </>
                )}
                {v.status === 'rejected' && v.reviewNote && (
                  <p className="text-caption text-destructive">Reason: {v.reviewNote}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-small text-muted-foreground">No documents submitted yet.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
