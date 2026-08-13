import { z } from 'zod';

export const createBranchSchema = z.object({
  code: z.string().min(1, 'Branch code is required'),
  name: z.string().min(1, 'Branch name is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
  lanes: z.number().int().nonnegative(),
  capacity: z.number().int().nonnegative(),
  armsLicense: z.string().optional().or(z.literal('')),
  armsLicenseExpiry: z.string().optional().or(z.literal('')),
  status: z.string().default('active'),
  manager: z.string().min(1, 'Manager is required'),
  workingHours: z.string().min(1, 'Working hours are required'),
});

export const updateBranchSchema = createBranchSchema.partial();
