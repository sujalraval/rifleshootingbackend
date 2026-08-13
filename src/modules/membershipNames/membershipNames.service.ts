import prisma from '../../core/prisma';

export const getAll = async () => {
  return await prisma.membershipName.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const create = async (data: any) => {
  return await prisma.membershipName.create({ data });
};

export const update = async (id: string, data: any) => {
  return await prisma.membershipName.update({
    where: { id },
    data,
  });
};

export const toggleStatus = async (id: string) => {
  const record = await prisma.membershipName.findUnique({ where: { id } });
  if (!record) throw new Error('Membership Name not found');

  return await prisma.membershipName.update({
    where: { id },
    data: { status: record.status === 'Active' ? 'Inactive' : 'Active' },
  });
};

export const remove = async (id: string) => {
  return await prisma.membershipName.delete({ where: { id } });
};
