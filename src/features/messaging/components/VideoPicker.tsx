import { useRef, useState } from 'react';
import { Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAX_DURATION_SECONDS = 60;
const MAX_SIZE_BYTES = 25 * 1024 * 1024;

interface VideoPickerProps {
  onSelect: (file: File | null) => void;
}

export function VideoPicker({ onSelect }: VideoPickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    setError(null);
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      setError('Video must be under 25MB.');
      return;
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    video.setAttribute('aria-hidden', 'true');
    video.onloadedmetadata = () => {
      if (video.duration > MAX_DURATION_SECONDS) {
        setError('Video must be 60 seconds or shorter.');
        URL.revokeObjectURL(url);
        return;
      }
      setPreviewUrl(url);
      onSelect(file);
    };
  };

  const clear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    onSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2">
        <p className="flex-1 text-caption text-destructive">{error}</p>
        <Button size="sm" variant="ghost" onClick={() => setError(null)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  if (previewUrl) {
    return (
      <div className="relative w-fit">
        <video src={previewUrl} controls>
          <track kind="captions" />
        </video>
        <button
          type="button"
          onClick={clear}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center self-end rounded-md border hover:bg-accent">
      <Video className="h-4 w-4 text-muted-foreground" />
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
