import prisma from '../../core/prisma';
import { Prisma } from '@prisma/client';

export const findAll = async () => {
  return await prisma.inventoryItem.findMany({
    include: { branch: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

export const findById = async (id: string) => {
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: { branch: true }
  });
  if (!item) throw new Error('Inventory item not found');
  return item;
};

export const create = async (data: any) => {
  const existing = await prisma.inventoryItem.findUnique({ where: { code: data.code } });
  if (existing) throw new Error('Item code already exists');
  
  return await prisma.inventoryItem.create({ data });
};

export const update = async (id: string, data: any) => {
  return await prisma.inventoryItem.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return await prisma.inventoryItem.delete({
    where: { id }
  });
};
