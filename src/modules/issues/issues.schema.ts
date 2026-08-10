import { z } from 'zod';

export const issueItemDetailSchema = z.object({
  itemCategory: z.string().min(1),
  itemSubCategory: z.string().min(1),
  item: z.string().min(1),
  uom: z.string().min(1),
  quantity: z.number().int().positive(),
  returnDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

export const createIssueSchema = z.object({
  institute: z.string().min(1, 'Institute is required'),
  memberOrGuest: z.enum(['Member', 'Guest']),
  memberIdOrGuestId: z.string().min(1),
  fullName: z.string().min(1),
  issueId: z.string().min(1),
  issueDate: z.string().transform((str) => new Date(str)),
  paymentTerm: z.string().min(1),
  totalQuantity: z.number().int().positive(),
  totalPayable: z.number().nonnegative(),
  totalDue: z.number().nonnegative(),
  items: z.array(issueItemDetailSchema).min(1, 'At least one item must be issued'),
});

export const updateIssueSchema = createIssueSchema.partial();
