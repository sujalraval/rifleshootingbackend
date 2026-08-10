import { z } from 'zod';

export const createAmmunitionSchema = z.object({
  caliber: z.string().min(1, 'Caliber is required'),
  type: z.string().min(1, 'Type is required'),
  batchLot: z.string().min(1, 'Batch/Lot is required'),
  openingStock: z.number().int().nonnegative(),
  received: z.number().int().nonnegative().default(0),
  issued: z.number().int().nonnegative().default(0),
  returned: z.number().int().nonnegative().default(0),
  consumed: z.number().int().nonnegative().default(0),
  date: z.string().transform((str) => new Date(str)),
  issuedTo: z.string().optional(),
  authorizedBy: z.string().optional(),
  lane: z.string().optional(),
  purpose: z.string().optional(),
  branchId: z.string().uuid('Invalid branch ID'),
});

export const updateAmmunitionSchema = createAmmunitionSchema.partial();
