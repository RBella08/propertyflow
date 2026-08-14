import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { maintenanceSchema, type MaintenanceFormInput } from '@/features/maintenance/schemas';
import { useCreateMaintenanceRequest } from '@/features/maintenance/hooks/useMaintenanceMutations';
import { MaintenanceImageUploader } from '@/features/maintenance/components/MaintenanceImageUploader';

const CATEGORIES = [
  'plumbing',
  'electrical',
  'security',
  'cleaning',
  'water',
  'internet',
  'structural',
  'other',
];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const SELECT_CLASSES =
  'flex h-10 w-full cursor-pointer rounded-md border border-input bg-card px-3 py-2 text-sm font-medium capitalize text-foreground shadow-sm outline-none transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function CreateMaintenancePage() {
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const createRequest = useCreateMaintenanceRequest();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormInput>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: { category: 'other', priority: 'medium' },
  });

  const onSubmit = async (data: MaintenanceFormInput) => {
    try {
      await createRequest.mutateAsync({ input: data, imageFiles });
      toast.success('Request submitted', { description: 'Your landlord has been notified.' });
      navigate('/tenant/maintenance');
    } catch (error) {
      toast.error('Failed to submit request', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <Link
        to="/tenant/maintenance"
        className="mb-4 flex w-fit items-center gap-1 text-small text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Maintenance
      </Link>
      <h1 className="mb-6 text-h4 text-foreground">Report an Issue</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" {...register('subject')} error={!!errors.subject} />
              {errors.subject && (
                <p className="text-caption text-destructive">{errors.subject.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Category</Label>
                <select id="category" {...register('category')} className={SELECT_CLASSES}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="capitalize">
                      {c.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="priority">Priority</Label>
                <select id="priority" {...register('priority')} className={SELECT_CLASSES}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p} className="capitalize">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                {...register('description')}
                error={!!errors.description}
              />
              {errors.description && (
                <p className="text-caption text-destructive">{errors.description.message}</p>
              )}
            </div>
            <MaintenanceImageUploader files={imageFiles} onFilesChange={setImageFiles} />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tenant/maintenance')}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
