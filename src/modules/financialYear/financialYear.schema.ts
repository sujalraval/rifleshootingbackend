import { z } from 'zod';

export const financialYearSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  fromDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.\d{3}Z)?$/)),
  toDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.\d{3}Z)?$/)),
  currentYear: z.boolean().optional(),
});

export const updateFinancialYearSchema = financialYearSchema.partial();
