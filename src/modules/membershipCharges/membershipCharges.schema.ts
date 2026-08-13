import { z } from 'zod';

export const membershipChargeSchema = z.object({
  institute: z.string().min(1, 'Institute is required'),
  name: z.string().min(1, 'Plan name is required'),
  days: z.number().int().positive('Days must be a positive number'),
  wefDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.\d{3}Z)?$/)),
  cost: z.number().nonnegative('Cost cannot be negative'),
  renewalCost: z.number().nonnegative().optional().default(0),
  gst: z.string().optional().or(z.literal('')),
  renewal: z.boolean().optional().default(false),
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
});

export const updateMembershipChargeSchema = membershipChargeSchema.partial();
