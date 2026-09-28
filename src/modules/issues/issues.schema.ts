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
  // issueId and totalQuantity are set by the server
  issueDate: z.string().transform((str) => new Date(str)),
  paymentTerm: z.enum(['Free', 'Payment']),
  totalPayable: z.number().nonnegative().default(0),
  totalDue: z.number().nonnegative().default(0),
  items: z.array(issueItemDetailSchema).min(1, 'At least one item must be issued'),
}).refine((d) => d.totalDue <= d.totalPayable, { message: 'Amount due cannot exceed the total payable', path: ['totalDue'] })
  .refine((d) => d.paymentTerm === 'Payment' || (d.totalPayable === 0 && d.totalDue === 0), { message: 'Free issues cannot have charges', path: ['totalPayable'] });

