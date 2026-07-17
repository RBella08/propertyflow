import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTerminateLease } from '../hooks/useLeaseMutations';

interface TerminateLeaseDialogProps {
  leaseId: string | null;
  leaseNumber: string;
  onClose: () => void;
}

export function TerminateLeaseDialog({ leaseId, leaseNumber, onClose }: TerminateLeaseDialogProps) {
  const terminateLease = useTerminateLease();

  const handleTerminate = async () => {
    if (!leaseId) return;
    try {
      await terminateLease.mutateAsync(leaseId);
      toast.success('Lease terminated', { description: 'The unit is now marked as available.' });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error('Could not terminate lease', { description: message });
    }
  };

  return (
    <Dialog open={!!leaseId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terminate lease {leaseNumber}?</DialogTitle>
          <DialogDescription>
            This ends the lease immediately and frees up the unit for a new tenant. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={terminateLease.isPending}
            onClick={handleTerminate}
          >
            Terminate Lease
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
