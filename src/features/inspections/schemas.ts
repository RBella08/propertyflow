import { z } from 'zod';

export const inspectionSchema = z.object({
  visitorName: z.string().min(2, 'Name is required'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  email: z.email('Enter a valid email address'),
  preferredDate: z.string().min(1, 'Select a preferred date'),
  preferredTime: z.string().min(1, 'Select a preferred time'),
  notes: z.string().optional(),
});

export type InspectionFormInput = z.infer<typeof inspectionSchema>;
