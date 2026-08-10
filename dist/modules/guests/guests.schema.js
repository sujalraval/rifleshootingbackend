"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSchema = exports.createSchema = void 0;
const zod_1 = require("zod");
exports.createSchema = zod_1.z.any(); // Basic validation, can be expanded based on Prisma schema
exports.updateSchema = zod_1.z.any();
