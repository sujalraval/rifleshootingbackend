"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.create = exports.findById = exports.findAll = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
const findAll = async () => {
    return await prisma_1.default.issueItemRecord.findMany({
        include: { items: true },
        orderBy: { issueDate: 'desc' }
    });
};
exports.findAll = findAll;
const findById = async (id) => {
    const issue = await prisma_1.default.issueItemRecord.findUnique({
        where: { id },
        include: { items: true }
    });
    if (!issue)
        throw new Error('Issue record not found');
    return issue;
};
exports.findById = findById;
const create = async (data) => {
    const existing = await prisma_1.default.issueItemRecord.findUnique({ where: { issueId: data.issueId } });
    if (existing)
        throw new Error('Issue ID already exists');
    const { items, ...recordData } = data;
    // Use Prisma Transaction to ensure both the Record and Details save together
    return await prisma_1.default.$transaction(async (tx) => {
        const issueRecord = await tx.issueItemRecord.create({
            data: recordData
        });
        // Create all nested items attached to this issue
        const itemDetails = items.map((item) => ({
            ...item,
            issueRecordId: issueRecord.id
        }));
        await tx.issueItemDetail.createMany({
            data: itemDetails
        });
        // Note: Deducting from InventoryItem stock would go here if required by business logic.
        // e.g., for each item, tx.inventoryItem.update({ data: { quantity: { decrement: item.quantity } } })
        return await tx.issueItemRecord.findUnique({
            where: { id: issueRecord.id },
            include: { items: true }
        });
    });
};
exports.create = create;
const remove = async (id) => {
    // Cascading delete is handled by Prisma schema (@relation onDelete: Cascade)
    return await prisma_1.default.issueItemRecord.delete({
        where: { id }
    });
};
exports.remove = remove;
