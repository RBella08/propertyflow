import { z } from 'zod';

export const leaseSchema = z
  .object({
    unitId: z.string().min(1, 'Select a unit'),
    tenantId: z.string().min(1, 'Look up and select a tenant first'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    monthlyRent: z.number().positive('Rent must be greater than 0'),
    securityDeposit: z.number().min(0),
    billingCycle: z.enum(['monthly', 'quarterly', 'annually']),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type LeaseFormInput = z.infer<typeof leaseSchema>;
