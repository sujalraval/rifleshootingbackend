import { z } from 'zod';

const nameFields = {
  name: z.string().trim().min(1, 'Membership name is required'),
  status: z.enum(['Active', 'Inactive']),
};

export const membershipNameSchema = z.object({ ...nameFields, status: nameFields.status.optional().default('Active') });

// No defaults here, so an edit never resets omitted fields
export const updateMembershipNameSchema = z.object(nameFields).partial();
