import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgreementForLease } from '../hooks/useAgreement';

interface ViewAgreementDialogProps {
  open: boolean;
  onClose: () => void;
  leaseId: string;
}

export function ViewAgreementDialog({ open, onClose, leaseId }: ViewAgreementDialogProps) {
  const { data: agreement, isLoading } = useAgreementForLease(open ? leaseId : undefined);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tenancy Agreement</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : agreement && agreement.status === 'signed' ? (
          <div className="flex flex-col gap-4">
            <Badge variant="success" className="w-fit">
              Signed {agreement.signedAt && new Date(agreement.signedAt).toLocaleDateString()}
            </Badge>
            <div>
              <p className="text-caption text-muted-foreground">Guarantor</p>
              <p className="text-small text-foreground">
                {agreement.guarantorName} ({agreement.guarantorRelationship})
              </p>
              <p className="text-small text-muted-foreground">
                {agreement.guarantorPhone} · {agreement.guarantorEmail}
              </p>
              <p className="text-small text-muted-foreground">{agreement.guarantorAddress}</p>
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Signed By</p>
              <p className="text-small text-foreground">{agreement.typedName}</p>
            </div>
            {agreement.signatureData && (
              <div>
                <p className="mb-1 text-caption text-muted-foreground">Signature</p>
                <img
                  src={agreement.signatureData}
                  alt="Signature"
                  className="h-24 rounded-md border bg-white p-2"
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-small text-muted-foreground">
            This tenant hasn&apos;t completed their tenancy agreement yet.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
