import { z } from 'zod';

// Fields without defaults: the update schema is built from these so an edit never resets omitted fields
const chargeFields = {
  institute: z.string().min(1, 'Institute is required'),
  name: z.string().trim().min(1, 'Plan name is required'),
  days: z.number().int('Days must be a whole number').positive('Days must be a positive number'),
  wefDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.\d{3}Z)?$/)),
  cost: z.number().nonnegative('Cost cannot be negative'),
  renewalCost: z.number().nonnegative('Renewal cost cannot be negative'),
  // Stored as text like "18%"; must be a number between 0 and 100
  gst: z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d+(\.\d+)?%?$/.test(v) && parseFloat(v) <= 100), 'GST must be a percentage between 0 and 100')
    .transform((v) => (v === '' ? '0%' : `${parseFloat(v)}%`)),
  renewal: z.boolean(),
  planFor: z.enum(['Member', 'S1']),
  status: z.enum(['Active', 'Inactive']),
};

export const membershipChargeSchema = z.object({
  ...chargeFields,
  renewalCost: chargeFields.renewalCost.optional().default(0),
  gst: chargeFields.gst.optional().default('0%'),
  renewal: chargeFields.renewal.optional().default(false),
  planFor: chargeFields.planFor.optional().default('Member'),
  status: chargeFields.status.optional().default('Active'),
});

export const updateMembershipChargeSchema = z.object(chargeFields).partial();
