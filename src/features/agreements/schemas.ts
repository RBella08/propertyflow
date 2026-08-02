import { z } from 'zod';

export const agreementSchema = z.object({
  guarantorName: z.string().min(2, 'Guarantor name is required'),
  guarantorPhone: z.string().min(7, 'Enter a valid phone number'),
  guarantorEmail: z.string().email('Enter a valid email address'),
  guarantorAddress: z.string().min(5, 'Guarantor address is required'),
  guarantorRelationship: z.string().min(2, 'Describe your relationship to the guarantor'),
  rulesAcknowledged: z
    .boolean()
    .refine((v) => v === true, 'You must acknowledge the rules to continue'),
  typedName: z.string().min(2, 'Type your full legal name to confirm'),
});

export type AgreementFormInput = z.infer<typeof agreementSchema>;
