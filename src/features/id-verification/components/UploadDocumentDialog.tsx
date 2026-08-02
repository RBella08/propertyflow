import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSubmitVerification } from '../hooks/useIdVerification';
import type { DocumentType } from '../services/idVerificationService';

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'nin_slip', label: 'NIN Slip' },
  { value: 'bvn_slip', label: 'BVN Slip' },
  { value: 'passport', label: 'International Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'voters_card', label: "Voter's Card (PVC)" },
];

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UploadDocumentDialog({ open, onClose }: UploadDocumentDialogProps) {
  const submitVerification = useSubmitVerification();
  const [documentType, setDocumentType] = useState<DocumentType>('nin_slip');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (selected: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(
      selected && selected.type.startsWith('image/') ? URL.createObjectURL(selected) : null
    );
  };

  const handleClear = () => {
    handleFileChange(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Select a file to upload');
      return;
    }
    try {
      await submitVerification.mutateAsync({ documentType, file });
      toast.success('Document submitted', { description: 'Your landlord will review it shortly.' });
      handleClear();
      onClose();
    } catch (error) {
      toast.error('Could not submit document', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload ID Document</DialogTitle>
          <DialogDescription>
            Visible only to you, your landlord/manager, and platform admins. Review your file
            carefully before submitting — you can remove and reselect if it's wrong.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="docType">Document Type</Label>
            <select
              id="docType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {DOCUMENT_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {!file ? (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-input p-6 text-center hover:bg-accent">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-small text-muted-foreground">
                Click to select a photo (JPG, PNG, or PDF)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <div className="relative rounded-card border p-3">
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Selected document preview"
                  className="mx-auto max-h-64 rounded-md object-contain"
                />
              ) : (
                <p className="py-8 text-center text-small text-muted-foreground">
                  {file.name} (PDF)
                </p>
              )}
              <p className="mt-2 text-center text-caption text-muted-foreground">
                Not the right file? Click the X above to remove and choose again.
              </p>
            </div>
          )}

          <Button onClick={handleSubmit} loading={submitVerification.isPending} disabled={!file}>
            Submit for Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
