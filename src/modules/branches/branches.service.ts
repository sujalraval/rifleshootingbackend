import prisma from '../../core/prisma';
import { Prisma } from '@prisma/client';

export const findAll = async () => {
  return await prisma.branch.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const findById = async (id: string) => {
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: {
      _count: {
        select: { members: true, employees: true }
      }
    }
  });
  if (!branch) throw new Error('Branch not found');
  return branch;
};

export const create = async (data: Prisma.BranchCreateInput) => {
  const existing = await prisma.branch.findUnique({ where: { code: data.code } });
  if (existing) throw new Error('Branch with this code already exists');
  
  return await prisma.branch.create({ data });
};

export const update = async (id: string, data: Prisma.BranchUpdateInput) => {
  return await prisma.branch.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return await prisma.branch.delete({
    where: { id }
  });
};
