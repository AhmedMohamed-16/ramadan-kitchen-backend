import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['ADMIN', 'DISTRIBUTOR', 'ACCOUNTANT'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'DISTRIBUTOR', 'ACCOUNTANT']).optional(),
  isActive: z.boolean().optional(),
});