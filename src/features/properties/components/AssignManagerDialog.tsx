import { useState } from 'react';
import { toast } from 'sonner';
import { Search, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { findManagerByEmail, assignManagerToProperty } from '../services/propertyManagementService';

interface AssignManagerDialogProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  currentManagerId: string | null;
  onAssigned: () => void;
}

export function AssignManagerDialog({
  open,
  onClose,
  propertyId,
  propertyName,
  currentManagerId,
  onAssigned,
}: AssignManagerDialogProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'error'>('idle');
  const [foundManager, setFoundManager] = useState<{ profileId: string; fullName: string } | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLookup = async () => {
    setStatus('loading');
    try {
      const result = await findManagerByEmail(email);
      setFoundManager(result);
      setStatus('found');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Manager not found');
    }
  };

  const handleAssign = async () => {
    if (!foundManager) return;
    setSaving(true);
    try {
      await assignManagerToProperty(propertyId, foundManager.profileId);
      toast.success('Manager assigned');
      onAssigned();
      onClose();
    } catch {
      toast.error('Could not assign manager');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await assignManagerToProperty(propertyId, null);
      toast.success('Manager removed');
      onAssigned();
      onClose();
    } catch {
      toast.error('Could not remove manager');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Manager</DialogTitle>
          <DialogDescription>
            Assign an estate manager to &quot;{propertyName}&quot;. The account must already be
            registered with the Manager role — an admin can set this at /admin/users.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Manager's email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setStatus('idle');
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleLookup}
              disabled={!email || status === 'loading'}
            >
              <Search className="mr-1.5 h-4 w-4" /> Find
            </Button>
          </div>
          {status === 'found' && foundManager && (
            <p className="flex items-center gap-1.5 text-caption text-success">
              <Check className="h-3.5 w-3.5" /> Found: {foundManager.fullName}
            </p>
          )}
          {status === 'error' && <p className="text-caption text-destructive">{errorMessage}</p>}
        </div>

        <DialogFooter>
          {currentManagerId && (
            <Button
              variant="outline"
              className="text-destructive"
              onClick={handleRemove}
              loading={saving}
            >
              <X className="mr-1.5 h-4 w-4" /> Remove Current Manager
            </Button>
          )}
          <Button onClick={handleAssign} disabled={!foundManager} loading={saving}>
            Assign Manager
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
