import prisma from '../../core/prisma';

export const findAll = async () => {
  return await prisma.incident.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const findById = async (id: string) => {
  const record = await prisma.incident.findUnique({ where: { id } });
  if (!record) throw new Error('Record not found');
  return record;
};

export const create = async (data: any) => {
  return await prisma.incident.create({ data });
};

export const update = async (id: string, data: any) => {
  return await prisma.incident.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return await prisma.incident.delete({
    where: { id }
  });
};
