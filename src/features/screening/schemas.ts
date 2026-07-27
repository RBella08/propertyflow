import { z } from 'zod';

export const screeningReviewSchema = z.object({
  paymentReliability: z.enum(['excellent', 'good', 'fair', 'poor']),
  propertyCare: z.enum(['excellent', 'good', 'fair', 'poor']),
  wouldRentAgain: z.enum(['yes', 'no']),
  comments: z.string().optional(),
});

export type ScreeningReviewFormInput = z.infer<typeof screeningReviewSchema>;
