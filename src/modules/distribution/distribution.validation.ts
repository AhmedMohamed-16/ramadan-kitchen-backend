// src/modules/distribution/distribution.validation.ts

import { z } from 'zod';

export const initDistributionSchema = z.object({
  notes: z.string().optional(),
});

export const updateAllocationSchema = z
  .object({
    received: z.boolean().optional(),
    mealsDelivered: z.number().int().min(0).optional(),
    notes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const recordHomeDeliverySchema = z.object({
  beneficiaryId: z.string().uuid('Invalid beneficiary ID'),
  mealsDelivered: z.number().int().min(1, 'mealsDelivered must be at least 1'),
  notes: z.string().optional(),
});