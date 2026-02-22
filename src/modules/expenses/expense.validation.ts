import { z } from 'zod';

export const createExpenseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.enum(['FOOD', 'TRANSPORT', 'UTILITIES', 'SUPPLIES', 'MAINTENANCE', 'OTHER']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const updateExpenseSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  amount: z.number().positive().optional(),
  category: z.enum(['FOOD', 'TRANSPORT', 'UTILITIES', 'SUPPLIES', 'MAINTENANCE', 'OTHER']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});