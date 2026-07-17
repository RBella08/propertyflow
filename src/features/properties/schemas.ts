import { z } from 'zod';

export const propertySchema = z.object({
  propertyName: z.string().min(3, 'Property name must be at least 3 characters'),
  description: z.string().max(2000).optional(),
  propertyType: z.enum(['apartment', 'house', 'duplex', 'bungalow', 'studio', 'office']),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2),
  amenityIds: z.array(z.string()),
});

export type PropertyFormInput = z.input<typeof propertySchema>;
