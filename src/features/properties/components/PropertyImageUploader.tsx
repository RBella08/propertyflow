import { useCallback, useState } from 'react';
import { Upload, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyImageUploaderProps {
  files: File[];
  coverIndex: number;
  onFilesChange: (files: File[]) => void;
  onCoverChange: (index: number) => void;
}

export function PropertyImageUploader({
  files,
  coverIndex,
  onFilesChange,
  onCoverChange,
}: PropertyImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const valid = Array.from(newFiles).filter(
        (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
      );
      onFilesChange([...files, ...valid]);
    },
    [files, onFilesChange]
  );

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    onFilesChange(next);
    if (coverIndex >= next.length) onCoverChange(0);
  };

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-8 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent'
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-small font-medium text-foreground">
          Drag & drop images, or click to browse
        </p>
        <p className="text-caption text-muted-foreground">JPG or PNG, up to 5MB each</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-md border"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Upload ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onCoverChange(index)}
                className={cn(
                  'absolute bottom-1 left-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium',
                  index === coverIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background/90 text-foreground opacity-0 group-hover:opacity-100'
                )}
              >
                <Star className="h-3 w-3" fill={index === coverIndex ? 'currentColor' : 'none'} />
                {index === coverIndex ? 'Cover' : 'Set cover'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
