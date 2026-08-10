"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.findById = exports.findAll = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
const findAll = async () => {
    return await prisma_1.default.lead.findMany({
        orderBy: { createdAt: 'desc' }
    });
};
exports.findAll = findAll;
const findById = async (id) => {
    const record = await prisma_1.default.lead.findUnique({ where: { id } });
    if (!record)
        throw new Error('Record not found');
    return record;
};
exports.findById = findById;
const create = async (data) => {
    return await prisma_1.default.lead.create({ data });
};
exports.create = create;
const update = async (id, data) => {
    return await prisma_1.default.lead.update({
        where: { id },
        data
    });
};
exports.update = update;
const remove = async (id) => {
    return await prisma_1.default.lead.delete({
        where: { id }
    });
};
exports.remove = remove;
