import { useState } from 'react';
import { toast } from 'sonner';
import { Star, Trash2, Upload } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  usePropertyImages,
  useAddPropertyImages,
  useSetCoverImage,
  useDeletePropertyImage,
} from '../hooks/usePropertyMutations';

interface PropertyImageManagerProps {
  propertyId: string;
}

export function PropertyImageManager({ propertyId }: PropertyImageManagerProps) {
  const { data: images, isLoading } = usePropertyImages(propertyId);
  const addImages = useAddPropertyImages();
  const setCover = useSetCoverImage();
  const deleteImage = useDeletePropertyImage();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const valid = Array.from(files).filter(
      (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    setUploading(true);
    try {
      await addImages.mutateAsync({ propertyId, files: valid });
      toast.success('Photos added');
    } catch {
      toast.error('Could not upload photos');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetCover = async (imageId: string, imageUrl: string) => {
    try {
      await setCover.mutateAsync({ propertyId, imageId, imageUrl });
      toast.success('Cover photo updated');
    } catch {
      toast.error('Could not update cover photo');
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await deleteImage.mutateAsync({ imageId, propertyId });
      toast.success('Photo removed');
    } catch {
      toast.error('Could not remove photo');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-input p-6 text-center hover:bg-accent">
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="text-small text-muted-foreground">
          {uploading ? 'Uploading...' : 'Click to add photos (JPG or PNG, up to 5MB each)'}
        </p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {!isLoading && images && images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-md border"
            >
              <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSetCover(img.id, img.imageUrl)}
                className={cn(
                  'absolute bottom-1 left-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium',
                  img.isCover
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background/90 text-foreground opacity-0 group-hover:opacity-100'
                )}
              >
                <Star className="h-3 w-3" fill={img.isCover ? 'currentColor' : 'none'} />
                {img.isCover ? 'Cover' : 'Set cover'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
