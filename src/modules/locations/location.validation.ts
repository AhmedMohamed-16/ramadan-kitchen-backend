import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
});

export const updateLocationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});