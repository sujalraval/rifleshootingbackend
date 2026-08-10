"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIssueSchema = exports.createIssueSchema = exports.issueItemDetailSchema = void 0;
const zod_1 = require("zod");
exports.issueItemDetailSchema = zod_1.z.object({
    itemCategory: zod_1.z.string().min(1),
    itemSubCategory: zod_1.z.string().min(1),
    item: zod_1.z.string().min(1),
    uom: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive(),
    returnDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
});
exports.createIssueSchema = zod_1.z.object({
    institute: zod_1.z.string().min(1, 'Institute is required'),
    memberOrGuest: zod_1.z.enum(['Member', 'Guest']),
    memberIdOrGuestId: zod_1.z.string().min(1),
    fullName: zod_1.z.string().min(1),
    issueId: zod_1.z.string().min(1),
    issueDate: zod_1.z.string().transform((str) => new Date(str)),
    paymentTerm: zod_1.z.string().min(1),
    totalQuantity: zod_1.z.number().int().positive(),
    totalPayable: zod_1.z.number().nonnegative(),
    totalDue: zod_1.z.number().nonnegative(),
    items: zod_1.z.array(exports.issueItemDetailSchema).min(1, 'At least one item must be issued'),
});
exports.updateIssueSchema = exports.createIssueSchema.partial();
