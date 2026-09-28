import { z } from 'zod';

export const createBranchSchema = z.object({
  code: z.string().min(1, 'Branch code is required'),
  name: z.string().min(1, 'Branch name is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9]{2}[A-Z0-9]{13}$/, 'GSTIN must be 15 characters (e.g. 24ABCDE1234F1Z5)')
    .optional()
    .or(z.literal('')),
  lanes: z.number().int().positive('Lanes must be greater than 0'),
  capacity: z.number().int().positive('Capacity must be greater than 0'),
  armsLicense: z.string().optional().or(z.literal('')),
  armsLicenseExpiry: z.string().optional().or(z.literal('')),
  status: z.string(),
  manager: z.string().min(1, 'Manager is required'),
  workingHours: z.string().min(1, 'Working hours are required'),
});

// Create defaults to active; the update schema has no defaults so an edit never resets omitted fields
export const updateBranchSchema = createBranchSchema.partial();
export const createBranchWithDefaultsSchema = createBranchSchema.extend({ status: z.string().optional().default('active') });
