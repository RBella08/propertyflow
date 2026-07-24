import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { vendorSchema, type VendorFormInput } from '../schemas';
import { useCreateVendor } from '../hooks/useVendors';

const CATEGORIES = [
  'plumbing',
  'electrical',
  'structural',
  'appliance',
  'pest_control',
  'cleaning',
  'general',
];

interface VendorFormProps {
  open: boolean;
  onClose: () => void;
}

export function VendorForm({ open, onClose }: VendorFormProps) {
  const createVendor = useCreateVendor();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormInput>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { category: 'general' },
  });

  const onSubmit = async (data: VendorFormInput) => {
    try {
      await createVendor.mutateAsync(data);
      toast.success('Vendor added');
      reset();
      onClose();
    } catch {
      toast.error('Could not add vendor');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} error={!!errors.name} />
            {errors.name && <p className="text-caption text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              {...register('category')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} error={!!errors.email} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...register('notes')} />
          </div>
          <Button type="submit" loading={isSubmitting} className="w-fit">
            Add Vendor
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
