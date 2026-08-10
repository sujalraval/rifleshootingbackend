"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.findById = exports.findAll = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
const findAll = async () => {
    return await prisma_1.default.member.findMany({
        include: { branch: { select: { name: true, city: true } } },
        orderBy: { createdAt: 'desc' }
    });
};
exports.findAll = findAll;
const findById = async (id) => {
    const member = await prisma_1.default.member.findUnique({
        where: { id },
        include: { branch: true }
    });
    if (!member)
        throw new Error('Member not found');
    return member;
};
exports.findById = findById;
const create = async (data) => {
    const existing = await prisma_1.default.member.findUnique({ where: { memberId: data.memberId } });
    if (existing)
        throw new Error('Member ID already exists');
    return await prisma_1.default.member.create({ data });
};
exports.create = create;
const update = async (id, data) => {
    return await prisma_1.default.member.update({
        where: { id },
        data
    });
};
exports.update = update;
const remove = async (id) => {
    return await prisma_1.default.member.delete({
        where: { id }
    });
};
exports.remove = remove;
