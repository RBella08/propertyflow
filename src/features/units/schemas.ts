import { z } from 'zod';

export const unitSchema = z.object({
  propertyId: z.string().min(1, 'Select a property'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  rentAmount: z.number().positive(),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']),
});

export type UnitFormInput = z.infer<typeof unitSchema>;
