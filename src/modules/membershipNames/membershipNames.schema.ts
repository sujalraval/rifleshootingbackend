import { z } from 'zod';

export const membershipNameSchema = z.object({
  name: z.string().min(1, 'Membership name is required'),
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
});

export const updateMembershipNameSchema = membershipNameSchema.partial();
