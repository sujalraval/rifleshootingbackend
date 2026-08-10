"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.findById = exports.findAll = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
const findAll = async () => {
    return await prisma_1.default.inventoryItem.findMany({
        include: { branch: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
    });
};
exports.findAll = findAll;
const findById = async (id) => {
    const item = await prisma_1.default.inventoryItem.findUnique({
        where: { id },
        include: { branch: true }
    });
    if (!item)
        throw new Error('Inventory item not found');
    return item;
};
exports.findById = findById;
const create = async (data) => {
    const existing = await prisma_1.default.inventoryItem.findUnique({ where: { code: data.code } });
    if (existing)
        throw new Error('Item code already exists');
    return await prisma_1.default.inventoryItem.create({ data });
};
exports.create = create;
const update = async (id, data) => {
    return await prisma_1.default.inventoryItem.update({
        where: { id },
        data
    });
};
exports.update = update;
const remove = async (id) => {
    return await prisma_1.default.inventoryItem.delete({
        where: { id }
    });
};
exports.remove = remove;
