import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    gender: z.string().optional(),
    phone: z.string().optional(),
    dob: z.string().optional(),
    placeOfBirth: z.string().optional(),
    bloodGroup: z.string().optional(),
    maritalStatus: z.string().optional(),
    dateOfJoining: z.string().optional(),
    leaveOfDate: z.string().optional().nullable(),
    designation: z.string().optional(),
    address: z.string().optional(),
    photo: z.string().optional(),
    role: z.string().min(1),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    name: z.string().min(1).optional(),
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    gender: z.string().optional(),
    phone: z.string().optional(),
    dob: z.string().optional(),
    placeOfBirth: z.string().optional(),
    bloodGroup: z.string().optional(),
    maritalStatus: z.string().optional(),
    dateOfJoining: z.string().optional(),
    leaveOfDate: z.string().optional().nullable(),
    designation: z.string().optional(),
    address: z.string().optional(),
    photo: z.string().optional(),
    role: z.string().min(1).optional(),
  }),
});
