"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAmmunitionSchema = exports.createAmmunitionSchema = void 0;
const zod_1 = require("zod");
exports.createAmmunitionSchema = zod_1.z.object({
    caliber: zod_1.z.string().min(1, 'Caliber is required'),
    type: zod_1.z.string().min(1, 'Type is required'),
    batchLot: zod_1.z.string().min(1, 'Batch/Lot is required'),
    openingStock: zod_1.z.number().int().nonnegative(),
    received: zod_1.z.number().int().nonnegative().default(0),
    issued: zod_1.z.number().int().nonnegative().default(0),
    returned: zod_1.z.number().int().nonnegative().default(0),
    consumed: zod_1.z.number().int().nonnegative().default(0),
    date: zod_1.z.string().transform((str) => new Date(str)),
    issuedTo: zod_1.z.string().optional(),
    authorizedBy: zod_1.z.string().optional(),
    lane: zod_1.z.string().optional(),
    purpose: zod_1.z.string().optional(),
    branchId: zod_1.z.string().uuid('Invalid branch ID'),
});
exports.updateAmmunitionSchema = exports.createAmmunitionSchema.partial();
