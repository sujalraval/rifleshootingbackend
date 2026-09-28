import prisma from '../../core/prisma';
import { notFoundError } from '../../core/http';

export const findAll = async () => {
  return await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const findById = async (id: string) => {
  const record = await prisma.lead.findUnique({ where: { id } });
  if (!record) throw notFoundError('Record not found');
  return record;
};

export const create = async (data: any) => {
  return await prisma.lead.create({ data });
};

export const update = async (id: string, data: any) => {
  return await prisma.lead.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return await prisma.lead.delete({
    where: { id }
  });
};
