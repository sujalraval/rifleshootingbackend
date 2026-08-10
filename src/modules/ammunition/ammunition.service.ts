import prisma from '../../core/prisma';

export const findAll = async () => {
  return await prisma.ammunitionRecord.findMany({
    include: { branch: { select: { name: true } } },
    orderBy: { date: 'desc' }
  });
};

export const findById = async (id: string) => {
  const record = await prisma.ammunitionRecord.findUnique({
    where: { id },
    include: { branch: true }
  });
  if (!record) throw new Error('Record not found');
  return record;
};

export const create = async (data: any) => {
  // Calculate closing stock automatically
  const closingStock = data.openingStock + data.received - data.issued - data.consumed + data.returned;
  
  return await prisma.ammunitionRecord.create({
    data: {
      ...data,
      closingStock
    }
  });
};

export const update = async (id: string, data: any) => {
  const existing = await findById(id);
  
  // Recalculate closing stock if any variables change
  const openingStock = data.openingStock ?? existing.openingStock;
  const received = data.received ?? existing.received;
  const issued = data.issued ?? existing.issued;
  const consumed = data.consumed ?? existing.consumed;
  const returned = data.returned ?? existing.returned;
  
  const closingStock = openingStock + received - issued - consumed + returned;

  return await prisma.ammunitionRecord.update({
    where: { id },
    data: {
      ...data,
      closingStock
    }
  });
};

export const remove = async (id: string) => {
  return await prisma.ammunitionRecord.delete({
    where: { id }
  });
};
