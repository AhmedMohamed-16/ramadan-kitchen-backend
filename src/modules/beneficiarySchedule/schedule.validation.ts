import { z } from 'zod';

export const updateScheduleSchema = z.object({
  days: z
    .array(z.number().int().min(0, 'Day must be 0-6').max(6, 'Day must be 0-6'))
    .min(1, 'At least one day must be selected')
    .max(7, 'Cannot have more than 7 days')
    .refine((days) => new Set(days).size === days.length, {
      message: 'Days must be unique',
    }),
});