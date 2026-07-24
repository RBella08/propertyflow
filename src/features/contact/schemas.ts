import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.email('Enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Please write a bit more detail'),
});

export type ContactInput = z.infer<typeof contactSchema>;
