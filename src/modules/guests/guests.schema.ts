import { z } from 'zod';

const optionalText = z.string().trim().nullish().transform((v) => (v ? v : null));

const guestFields = {
  institute: z.string({ error: 'Institute is required' }).trim().min(1, 'Institute is required'),
  firstName: z.string({ error: 'First name is required' }).trim().min(1, 'First name is required'),
  lastName: z.string({ error: 'Last name is required' }).trim().min(1, 'Last name is required'),
  dateOfBirth: z
    .string({ error: 'Date of birth is required' })
    .min(1, 'Date of birth is required')
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()) && d <= new Date(), 'Enter a valid date of birth'),
  gender: z.enum(['Male', 'Female', 'Other'], { error: 'Gender is required' }),
  email: z.string({ error: 'Email is required' }).trim().email('Invalid email address'),
  mobile: z.string({ error: 'Mobile number is required' }).trim().regex(/^\+?[\d\s-]{10,15}$/, 'Enter a valid mobile number'),
  address: optionalText,
  city: optionalText,
  state: optionalText,
  country: optionalText,
  pincode: optionalText,
  photo: optionalText,
  idCard: optionalText,
  status: z.enum(['Active', 'Inactive']),
};

// guestId is assigned by the server
export const createSchema = z.object({ ...guestFields, status: guestFields.status.optional().default('Active') });
export const updateSchema = z.object(guestFields).partial();
