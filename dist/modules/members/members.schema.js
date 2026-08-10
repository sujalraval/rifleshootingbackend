"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMemberSchema = exports.createMemberSchema = void 0;
const zod_1 = require("zod");
exports.createMemberSchema = zod_1.z.object({
    memberId: zod_1.z.string().min(1, 'Member ID is required'),
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    photo: zod_1.z.string().optional(),
    age: zod_1.z.number().int().positive(),
    gender: zod_1.z.string(),
    package: zod_1.z.string(),
    status: zod_1.z.string(),
    joinDate: zod_1.z.string().transform((str) => new Date(str)),
    expiryDate: zod_1.z.string().transform((str) => new Date(str)),
    discipline: zod_1.z.string(),
    coach: zod_1.z.string(),
    batch: zod_1.z.string(),
    attendanceRate: zod_1.z.number().min(0).max(100).default(0),
    totalPaid: zod_1.z.number().min(0).default(0),
    dueAmount: zod_1.z.number().min(0).default(0),
    nraiId: zod_1.z.string().optional(),
    safetyExpiry: zod_1.z.string().optional(),
    branchId: zod_1.z.string().uuid('Invalid branch ID'),
});
exports.updateMemberSchema = exports.createMemberSchema.partial();
