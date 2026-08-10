import { z } from 'zod';

export const createInventorySchema = z.object({
  code: z.string().min(1, 'Item code is required'),
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().optional(),
  quantity: z.number().int().nonnegative(),
  reorderLevel: z.number().int().nonnegative(),
  unitPrice: z.number().nonnegative(),
  status: z.string(),
  lastUpdated: z.string().transform((str) => new Date(str)),
  branchId: z.string().uuid('Invalid branch ID'),
});

export const updateInventorySchema = createInventorySchema.partial();
