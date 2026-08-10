"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.findById = exports.findAll = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
const findAll = async () => {
    return await prisma_1.default.ammunitionRecord.findMany({
        include: { branch: { select: { name: true } } },
        orderBy: { date: 'desc' }
    });
};
exports.findAll = findAll;
const findById = async (id) => {
    const record = await prisma_1.default.ammunitionRecord.findUnique({
        where: { id },
        include: { branch: true }
    });
    if (!record)
        throw new Error('Record not found');
    return record;
};
exports.findById = findById;
const create = async (data) => {
    // Calculate closing stock automatically
    const closingStock = data.openingStock + data.received - data.issued - data.consumed + data.returned;
    return await prisma_1.default.ammunitionRecord.create({
        data: {
            ...data,
            closingStock
        }
    });
};
exports.create = create;
const update = async (id, data) => {
    const existing = await (0, exports.findById)(id);
    // Recalculate closing stock if any variables change
    const openingStock = data.openingStock ?? existing.openingStock;
    const received = data.received ?? existing.received;
    const issued = data.issued ?? existing.issued;
    const consumed = data.consumed ?? existing.consumed;
    const returned = data.returned ?? existing.returned;
    const closingStock = openingStock + received - issued - consumed + returned;
    return await prisma_1.default.ammunitionRecord.update({
        where: { id },
        data: {
            ...data,
            closingStock
        }
    });
};
exports.update = update;
const remove = async (id) => {
    return await prisma_1.default.ammunitionRecord.delete({
        where: { id }
    });
};
exports.remove = remove;
