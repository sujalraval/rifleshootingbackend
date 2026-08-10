"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBranchSchema = exports.createBranchSchema = void 0;
const zod_1 = require("zod");
exports.createBranchSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Branch code is required'),
    name: zod_1.z.string().min(1, 'Branch name is required'),
    city: zod_1.z.string().min(1, 'City is required'),
    address: zod_1.z.string().min(1, 'Address is required'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    email: zod_1.z.string().email('Invalid email address'),
    gstin: zod_1.z.string().min(1, 'GSTIN is required'),
    lanes: zod_1.z.number().int().nonnegative(),
    capacity: zod_1.z.number().int().nonnegative(),
    armsLicense: zod_1.z.string().min(1, 'Arms license is required'),
    armsLicenseExpiry: zod_1.z.string().min(1, 'Arms license expiry is required'),
    status: zod_1.z.string().default('active'),
    manager: zod_1.z.string().min(1, 'Manager is required'),
    workingHours: zod_1.z.string().min(1, 'Working hours are required'),
});
exports.updateBranchSchema = exports.createBranchSchema.partial();
