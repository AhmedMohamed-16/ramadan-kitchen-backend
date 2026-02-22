import { z } from 'zod';

export const createDonationSchema = z.object({
  donorId: z.string().uuid('Invalid donor ID'),
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CHECK', 'OTHER']).optional(),
  notes: z.string().optional(),
});