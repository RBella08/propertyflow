import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { contactPropertyOwner } from '../services/propertyContactService';

const contactOwnerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.email('Enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Please write a bit more detail'),
});

type ContactOwnerInput = z.infer<typeof contactOwnerSchema>;

interface ContactManagerDialogProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
}

export function ContactManagerDialog({
  open,
  onClose,
  propertyId,
  propertyName,
}: ContactManagerDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactOwnerInput>({ resolver: zodResolver(contactOwnerSchema) });

  const onSubmit = async (data: ContactOwnerInput) => {
    try {
      await contactPropertyOwner(propertyId, propertyName, data);
      toast.success('Message sent', {
        description: 'The property manager will get back to you soon.',
      });
      reset();
      onClose();
    } catch (error) {
      toast.error('Could not send message', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Manager</DialogTitle>
          <DialogDescription>Send a message about &quot;{propertyName}&quot;.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ownerName">Name</Label>
              <Input id="ownerName" {...register('name')} error={!!errors.name} />
              {errors.name && (
                <p className="text-caption text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ownerEmail">Email</Label>
              <Input id="ownerEmail" type="email" {...register('email')} error={!!errors.email} />
              {errors.email && (
                <p className="text-caption text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ownerPhone">Phone (optional)</Label>
            <Input id="ownerPhone" {...register('phone')} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ownerMessage">Message</Label>
            <Textarea
              id="ownerMessage"
              rows={4}
              {...register('message')}
              error={!!errors.message}
            />
            {errors.message && (
              <p className="text-caption text-destructive">{errors.message.message}</p>
            )}
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full">
            Send Message
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
