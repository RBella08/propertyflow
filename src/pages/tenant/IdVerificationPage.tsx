import { useState } from 'react';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VerificationStatusBadge } from '@/features/id-verification/components/VerificationStatusBadge';
import { UploadDocumentDialog } from '@/features/id-verification/components/UploadDocumentDialog';
import {
  useMyVerifications,
  useDeletePendingVerification,
} from '@/features/id-verification/hooks/useIdVerification';

const DOCUMENT_LABELS: Record<string, string> = {
  nin_slip: 'NIN Slip',
  bvn_slip: 'BVN Slip',
  passport: 'International Passport',
  drivers_license: "Driver's License",
  voters_card: "Voter's Card",
};

export function IdVerificationPage() {
  const { data: verifications, isLoading } = useMyVerifications();
  const deleteVerification = useDeletePendingVerification();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h4 text-foreground">ID Verification</h1>
          <p className="text-muted-foreground">
            Upload identification documents for your landlord to review.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : verifications && verifications.length > 0 ? (
        <div className="flex flex-col gap-3">
          {verifications.map((v) => (
            <Card key={v.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-foreground">{DOCUMENT_LABELS[v.documentType]}</p>
                  <p className="text-caption text-muted-foreground">
                    Submitted {new Date(v.submittedAt).toLocaleDateString()}
                  </p>
                  {v.status === 'rejected' && v.reviewNote && (
                    <p className="text-caption text-destructive">Reason: {v.reviewNote}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {v.signedUrl && (
                    <a
                      href={v.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-caption text-primary hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" /> View
                    </a>
                  )}
                  <VerificationStatusBadge status={v.status} />
                  {(v.status === 'pending' || v.status === 'rejected') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      title="Remove this document"
                      onClick={() =>
                        deleteVerification.mutate({
                          verificationId: v.id,
                          documentPath: v.documentPath,
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No documents submitted yet.</p>
      )}

      <UploadDocumentDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
