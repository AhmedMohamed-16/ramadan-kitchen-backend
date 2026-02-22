import { z } from 'zod';

export const createBeneficiarySchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
  numberOfChildren: z.number().int().min(0, 'Number of children cannot be negative').default(0),
  needLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  maxMealsPerDay: z.number().int().min(1, 'Must allow at least 1 meal').max(10).default(1),
  locationId: z.string().uuid('Invalid location ID'),
});

export const updateBeneficiarySchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  numberOfChildren: z.number().int().min(0).optional(),
  needLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  maxMealsPerDay: z.number().int().min(1).max(10).optional(),
  locationId: z.string().uuid().optional(),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean(),
});