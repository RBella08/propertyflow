import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRenewLease } from '../hooks/useLeaseMutations';

interface RenewLeaseDialogProps {
  leaseId: string | null;
  leaseNumber: string;
  currentEndDate: string;
  onClose: () => void;
}

export function RenewLeaseDialog({
  leaseId,
  leaseNumber,
  currentEndDate,
  onClose,
}: RenewLeaseDialogProps) {
  const [newEndDate, setNewEndDate] = useState(currentEndDate);
  const renewLease = useRenewLease();

  const handleRenew = async () => {
    if (!leaseId) return;
    try {
      await renewLease.mutateAsync({ leaseId, newEndDate });
      toast.success('Lease renewed');
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error('Could not renew lease', { description: message });
    }
  };

  return (
    <Dialog open={!!leaseId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renew lease {leaseNumber}</DialogTitle>
          <DialogDescription>Set the new end date for this lease.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="newEndDate">New end date</Label>
          <Input
            id="newEndDate"
            type="date"
            value={newEndDate}
            onChange={(e) => setNewEndDate(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={renewLease.isPending} onClick={handleRenew}>
            Renew Lease
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
