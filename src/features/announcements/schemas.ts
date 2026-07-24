import { z } from 'zod';

export const announcementSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  body: z.string().min(10, 'Please write a bit more detail'),
});

export type AnnouncementFormInput = z.infer<typeof announcementSchema>;
