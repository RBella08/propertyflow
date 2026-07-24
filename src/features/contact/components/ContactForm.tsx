import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { contactSchema, type ContactInput } from '../schemas';
import { submitContactMessage } from '../services/contactService';

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    try {
      await submitContactMessage(data);
      toast.success('Message sent', { description: "We'll get back to you shortly." });
      reset();
    } catch (error) {
      toast.error('Failed to send message', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} error={!!errors.name} />
          {errors.name && <p className="text-caption text-destructive">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} error={!!errors.email} />
          {errors.email && <p className="text-caption text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" {...register('phone')} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" {...register('subject')} error={!!errors.subject} />
        {errors.subject && (
          <p className="text-caption text-destructive">{errors.subject.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} {...register('message')} error={!!errors.message} />
        {errors.message && (
          <p className="text-caption text-destructive">{errors.message.message}</p>
        )}
      </div>
      <Button type="submit" loading={isSubmitting} className="w-fit">
        Send Message
      </Button>
    </form>
  );
}
