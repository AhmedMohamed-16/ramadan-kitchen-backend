import { z } from 'zod';

export const createDonorSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
  locationId: z.string().uuid('Invalid location ID'),
  notes: z.string().optional(),
});

export const updateDonorSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  locationId: z.string().uuid().optional(),
  notes: z.string().optional(),
});