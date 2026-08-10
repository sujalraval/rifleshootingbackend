import { z } from 'zod';

export const createS1MemberSchema = z.object({
  s1S1MemberId: z.string().min(1, 'S1Member ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  photo: z.string().optional(),
  age: z.number().int().positive(),
  gender: z.string(),
  package: z.string(),
  status: z.string(),
  joinDate: z.string().transform((str) => new Date(str)),
  expiryDate: z.string().transform((str) => new Date(str)),
  discipline: z.string(),
  coach: z.string(),
  batch: z.string(),
  attendanceRate: z.number().min(0).max(100).default(0),
  totalPaid: z.number().min(0).default(0),
  dueAmount: z.number().min(0).default(0),
  nraiId: z.string().optional(),
  safetyExpiry: z.string().optional(),
  branchId: z.string().uuid('Invalid branch ID'),
});

export const updateS1MemberSchema = createS1MemberSchema.partial();
