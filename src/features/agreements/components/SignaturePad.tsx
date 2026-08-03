import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
}

export function SignaturePad({ onChange }: SignaturePadProps) {
  const padRef = useRef<SignatureCanvas>(null);

  const handleEnd = () => {
    if (padRef.current) {
      onChange(padRef.current.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    padRef.current?.clear();
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption text-muted-foreground">Draw your signature below:</p>
      <div
        className="overflow-hidden rounded-md border-2 border-input"
        style={{ backgroundColor: '#ffffff' }}
      >
        <SignatureCanvas
          ref={padRef}
          penColor="#0F172A"
          minWidth={2}
          maxWidth={4}
          canvasProps={{
            className: 'w-full h-40',
            style: { backgroundColor: '#ffffff' },
          }}
          onEnd={handleEnd}
        />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleClear} className="w-fit">
        Clear Signature
      </Button>
    </div>
  );
}
