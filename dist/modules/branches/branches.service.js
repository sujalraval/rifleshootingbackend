"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.findById = exports.findAll = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
const findAll = async () => {
    return await prisma_1.default.branch.findMany({
        orderBy: { createdAt: 'desc' }
    });
};
exports.findAll = findAll;
const findById = async (id) => {
    const branch = await prisma_1.default.branch.findUnique({
        where: { id },
        include: {
            _count: {
                select: { members: true, employees: true }
            }
        }
    });
    if (!branch)
        throw new Error('Branch not found');
    return branch;
};
exports.findById = findById;
const create = async (data) => {
    const existing = await prisma_1.default.branch.findUnique({ where: { code: data.code } });
    if (existing)
        throw new Error('Branch with this code already exists');
    return await prisma_1.default.branch.create({ data });
};
exports.create = create;
const update = async (id, data) => {
    return await prisma_1.default.branch.update({
        where: { id },
        data
    });
};
exports.update = update;
const remove = async (id) => {
    return await prisma_1.default.branch.delete({
        where: { id }
    });
};
exports.remove = remove;
