import { z } from 'zod';

export const vendorSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  category: z.enum([
    'plumbing',
    'electrical',
    'structural',
    'appliance',
    'pest_control',
    'cleaning',
    'general',
  ]),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type VendorFormInput = z.infer<typeof vendorSchema>;
