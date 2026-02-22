import { z } from 'zod';

export const createExtraDistributionSchema = z.object({
  beneficiaryId: z.string().uuid('Invalid beneficiary ID'),
  mealsGiven: z.number().int().min(1, 'Must give at least 1 meal').max(20),
  notes: z.string().max(500).optional(),
});

export const createExtraWithNewBeneficiarySchema = z.object({
  beneficiary: z.object({
    fullName: z.string().min(1, 'Full name is required').max(100),
    phone: z.string().min(1, 'Phone is required').max(20),
    numberOfChildren: z.number().int().min(0).default(0),
    needLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    maxMealsPerDay: z.number().int().min(1).max(10).default(1),
    locationId: z.string().uuid('Invalid location ID'),
  }),
  mealsGiven: z.number().int().min(1, 'Must give at least 1 meal').max(20),
  notes: z.string().max(500).optional(),
});