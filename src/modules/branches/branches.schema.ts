import { z } from 'zod';

export const createBranchSchema = z.object({
  code: z.string().min(1, 'Branch code is required'),
  name: z.string().min(1, 'Branch name is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address'),
  gstin: z.string().min(1, 'GSTIN is required'),
  lanes: z.number().int().nonnegative(),
  capacity: z.number().int().nonnegative(),
  armsLicense: z.string().min(1, 'Arms license is required'),
  armsLicenseExpiry: z.string().min(1, 'Arms license expiry is required'),
  status: z.string().default('active'),
  manager: z.string().min(1, 'Manager is required'),
  workingHours: z.string().min(1, 'Working hours are required'),
});

export const updateBranchSchema = createBranchSchema.partial();
