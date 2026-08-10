import prisma from '../../core/prisma';

export const findAll = async () => {
  return await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const findById = async (id: string) => {
  const record = await prisma.employee.findUnique({ where: { id } });
  if (!record) throw new Error('Record not found');
  return record;
};

export const create = async (data: any) => {
  return await prisma.employee.create({ data });
};

export const update = async (id: string, data: any) => {
  return await prisma.employee.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return await prisma.employee.delete({
    where: { id }
  });
};
