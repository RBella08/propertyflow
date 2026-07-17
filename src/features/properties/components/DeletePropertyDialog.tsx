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
import { useDeleteProperty } from '../hooks/usePropertyMutations';

interface DeletePropertyDialogProps {
  propertyId: string | null;
  propertyName: string;
  onClose: () => void;
}

export function DeletePropertyDialog({
  propertyId,
  propertyName,
  onClose,
}: DeletePropertyDialogProps) {
  const deleteProperty = useDeleteProperty();

  const handleDelete = async () => {
    if (!propertyId) return;
    try {
      await deleteProperty.mutateAsync(propertyId);
      toast.success('Property deleted');
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error('Could not delete property', { description: message });
    }
  };

  return (
    <Dialog open={!!propertyId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &quot;{propertyName}&quot;?</DialogTitle>
          <DialogDescription>
            This permanently removes the property. Properties with existing units can&apos;t be
            deleted — archive them instead to hide them from public listings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" loading={deleteProperty.isPending} onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
