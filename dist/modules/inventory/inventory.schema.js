"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventorySchema = exports.createInventorySchema = void 0;
const zod_1 = require("zod");
exports.createInventorySchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Item code is required'),
    name: zod_1.z.string().min(1, 'Item name is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    make: zod_1.z.string().min(1, 'Make is required'),
    model: zod_1.z.string().min(1, 'Model is required'),
    serialNumber: zod_1.z.string().optional(),
    quantity: zod_1.z.number().int().nonnegative(),
    reorderLevel: zod_1.z.number().int().nonnegative(),
    unitPrice: zod_1.z.number().nonnegative(),
    status: zod_1.z.string(),
    lastUpdated: zod_1.z.string().transform((str) => new Date(str)),
    branchId: zod_1.z.string().uuid('Invalid branch ID'),
});
exports.updateInventorySchema = exports.createInventorySchema.partial();
