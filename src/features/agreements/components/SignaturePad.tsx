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
      <div className="rounded-md border bg-background">
        <SignatureCanvas
          ref={padRef}
          penColor="black"
          canvasProps={{ className: 'w-full h-40 rounded-md' }}
          onEnd={handleEnd}
        />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleClear} className="w-fit">
        Clear Signature
      </Button>
    </div>
  );
}
