import prisma, { rawPrisma } from '../../core/prisma';
import { notFoundError } from '../../core/http';

export const findAll = async () => {
  return await prisma.guest.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const findById = async (id: string) => {
  const record = await prisma.guest.findUnique({ where: { id } });
  if (!record) throw notFoundError('Record not found');
  return record;
};

// Sequential guest numbers G000001, G000002, ... (deleted guests keep their number)
const nextGuestId = async () => {
  const rows = await rawPrisma.guest.findMany({ where: { guestId: { startsWith: 'G' } }, select: { guestId: true } });
  const max = rows.reduce((m, r) => Math.max(m, Number(/^G(\d+)/.exec(r.guestId)?.[1] ?? 0)), 0);
  return `G${String(max + 1).padStart(6, '0')}`;
};

export const create = async (data: any) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.guest.create({ data: { ...data, guestId: await nextGuestId() } });
    } catch (error: any) {
      // Two guests created at the same moment: take the next number
      if (error?.code === 'P2002' && attempt < 2) continue;
      throw error;
    }
  }
};

export const update = async (id: string, data: any) => {
  return await prisma.guest.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return await prisma.guest.delete({
    where: { id }
  });
};
