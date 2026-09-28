import { z } from 'zod';

// Shared by Member and S1Member (same columns). Blank strings from forms are stored as null.
const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v ? v : null));
const optionalDate = z
  .string()
  .nullish()
  .transform((v) => (v ? new Date(v) : null))
  .refine((d) => d === null || !isNaN(d.getTime()), 'Invalid date');
const phone = (label: string) => z.string({ error: `${label} is required` }).trim().regex(/^\d{10}$/, `${label} must be exactly 10 digits`);
const optionalPhone = (label: string) =>
  z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^\d{10}$/.test(v), `${label} must be exactly 10 digits`);

const profileFields = {
  name: z.string({ error: 'Full name is required' }).trim().min(1, 'Full name is required'),
  email: z.string({ error: 'Email is required' }).trim().email('Invalid email'),
  phone: phone('Mobile number'),
  photo: optionalText,
  gender: z.string({ error: 'Gender is required' }).trim().min(1, 'Gender is required'),
  caste: optionalText,
  bloodGroup: optionalText,
  qualification: optionalText,
  occupation: optionalText,
  address: optionalText,
  state: optionalText,
  country: optionalText,
  pincode: optionalText,
  emergencyContactName: optionalText,
  emergencyContactNumber: optionalPhone('Emergency contact number'),
};

const admissionFields = {
  govtIdType: optionalText,
  govtIdProof: optionalText,
  govtIdProof2: optionalText,
  isStudent: z.boolean(),
  schoolCollegeName: optionalText,
  classYear: optionalText,
  bonafideDocument: optionalText,
  membershipFor: z.array(z.string().trim().min(1)),
  eligibilityCriteria: z.array(z.string().trim().min(1)),
  isLicenseHolder: z.boolean().nullish(),
  licenseDocument: optionalText,
  typeOfCourse: optionalText,
};

/**
 * Admission (create). The server assigns the membership number, branch, dates, age and dues
 * from the chosen plan, so none of those are accepted from the client.
 * `firearms` tells the validator whether the licence/eligibility section applies.
 */
export const admissionSchema = z
  .object({
    ...profileFields,
    ...admissionFields,
    // Defaults live here, not in admissionFields: .partial() (profile edit) would otherwise re-apply them
    isStudent: admissionFields.isStudent.optional().default(false),
    membershipFor: admissionFields.membershipFor.optional().default([]),
    eligibilityCriteria: admissionFields.eligibilityCriteria.optional().default([]),
    dob: z.string({ error: 'Date of birth is required' }).min(1, 'Date of birth is required').transform((v) => new Date(v)),
    package: z.string({ error: 'Membership category is required' }).trim().min(1, 'Membership category is required'),
    membershipChargeId: z.string({ error: 'Select a membership plan' }).uuid('Select a membership plan'),
    declarationAccepted: z.literal(true, { error: 'Please accept the declaration' }),
    firearms: z.boolean().optional().default(false),
  })
  .superRefine((d, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (isNaN(d.dob.getTime())) issue('dob', 'Invalid date of birth');
    else if (d.dob > new Date()) issue('dob', 'Date of birth cannot be in the future');
    if (!d.govtIdType) issue('govtIdType', 'Government ID type is required');
    if (!d.govtIdProof) issue('govtIdProof', 'Government ID proof upload is required');
    if (d.membershipFor.length === 0) issue('membershipFor', 'Select at least one discipline');
    if (d.isStudent && !d.schoolCollegeName) issue('schoolCollegeName', 'School/College name is required for students');
    if (d.firearms) {
      if (d.eligibilityCriteria.length === 0) issue('eligibilityCriteria', 'Select at least one eligibility criteria');
      if (d.isLicenseHolder == null) issue('isLicenseHolder', 'Select whether the applicant holds a licence');
      if (d.isLicenseHolder === true && !d.licenseDocument) issue('licenseDocument', 'Licence document upload is required');
      if (d.isLicenseHolder === false && !d.typeOfCourse) issue('typeOfCourse', 'Type of course is required');
    }
  });

export type AdmissionInput = z.infer<typeof admissionSchema>;

/** Profile edit (PUT /members/:id). Membership number, branch, plan and dues are not editable here. */
export const updateMemberSchema = z
  .object({
    ...profileFields,
    ...admissionFields,
    dob: optionalDate,
    status: z.enum(['Active', 'Inactive']),
    package: z.string().trim().min(1),
    discipline: z.string().trim().min(1),
    coach: optionalText,
    batch: optionalText,
    nraiId: optionalText,
    safetyExpiry: optionalText,
  })
  .partial();

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export const createSubscriptionSchema = z
  .object({
    membershipChargeId: z.string({ error: 'Select a membership charge' }).uuid('Select a membership charge'),
    startDate: z.string({ error: 'Start date is required' }).min(1, 'Start date is required').transform((v) => new Date(v)),
    amountPaid: z.number().nonnegative('Amount paid cannot be negative').default(0),
    discount: z.number().nonnegative('Discount cannot be negative').default(0),
    paymentMethod: optionalText,
    paymentInfo: optionalText,
    nextDueDate: optionalDate,
  })
  .refine((d) => !isNaN(d.startDate.getTime()), { message: 'Invalid start date', path: ['startDate'] })
  .refine((d) => d.amountPaid === 0 || !!d.paymentMethod, { message: 'Select a payment method', path: ['paymentMethod'] });

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const paymentSchema = z.object({
  amount: z.number({ error: 'Amount is required' }).positive('Amount must be greater than 0'),
  paymentMethod: z.string({ error: 'Select a payment method' }).trim().min(1, 'Select a payment method'),
  paymentInfo: optionalText,
});

export type PaymentInput = z.infer<typeof paymentSchema>;
