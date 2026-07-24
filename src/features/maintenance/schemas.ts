import { z } from 'zod';

export const maintenanceSchema = z.object({
  category: z.enum([
    'plumbing',
    'electrical',
    'security',
    'cleaning',
    'water',
    'internet',
    'structural',
    'other',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  subject: z.string().min(3, 'Subject is required'),
  description: z.string().min(10, 'Please describe the issue in more detail'),
});

export type MaintenanceFormInput = z.infer<typeof maintenanceSchema>;
