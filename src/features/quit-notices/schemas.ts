import { z } from 'zod';

export const quitNoticeSchema = z.object({
  reason: z.string().min(10, 'Please describe the reason'),
  vacateBy: z.string().min(1, 'Select a vacate-by date'),
});

export type QuitNoticeFormInput = z.infer<typeof quitNoticeSchema>;
