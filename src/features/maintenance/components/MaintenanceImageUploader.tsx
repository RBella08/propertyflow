import { Upload, X } from 'lucide-react';

interface MaintenanceImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function MaintenanceImageUploader({ files, onFilesChange }: MaintenanceImageUploaderProps) {
  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter(
      (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    onFilesChange([...files, ...valid]);
  };

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-input p-6 text-center hover:bg-accent">
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="text-small text-muted-foreground">Attach photos of the issue (optional)</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>
      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-md border"
            >
              <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
