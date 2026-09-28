import prisma from '../../core/prisma';
import { notFoundError } from '../../core/http';

export const getAll = async () => {
  return await prisma.membershipName.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

const assertNameFree = async (name: string, excludeId?: string) => {
  const clash = await prisma.membershipName.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (clash) throw new Error('Membership name already exists.');
};

export const create = async (data: any) => {
  const name = String(data.name).trim();
  await assertNameFree(name);
  return await prisma.membershipName.create({ data: { ...data, name } });
};

export const update = async (id: string, data: any) => {
  const current = await prisma.membershipName.findUnique({ where: { id } });
  if (!current) throw notFoundError('Membership Name not found');
  const name = typeof data.name === 'string' ? data.name.trim() : undefined;
  if (name && name.toLowerCase() !== current.name.toLowerCase()) await assertNameFree(name, id);

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.membershipName.update({ where: { id }, data: { ...data, ...(name ? { name } : {}) } });
    // Membership plans store the name as text
    if (name && name !== current.name) {
      await tx.membershipCharge.updateMany({ where: { name: current.name }, data: { name } });
    }
    return updated;
  });
};

export const toggleStatus = async (id: string) => {
  const record = await prisma.membershipName.findUnique({ where: { id } });
  if (!record) throw notFoundError('Membership Name not found');

  return await prisma.membershipName.update({
    where: { id },
    data: { status: record.status === 'Active' ? 'Inactive' : 'Active' },
  });
};

export const remove = async (id: string) => {
  const current = await prisma.membershipName.findUnique({ where: { id } });
  if (!current) throw notFoundError('Membership Name not found');
  const plans = await prisma.membershipCharge.count({ where: { name: current.name } });
  if (plans > 0) throw new Error(`Cannot delete: ${plans} membership plans use this name.`);
  return await prisma.membershipName.delete({ where: { id } });
};
