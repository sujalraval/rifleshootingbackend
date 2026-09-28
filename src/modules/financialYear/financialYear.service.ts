import prisma from '../../core/prisma';

export const getAllFinancialYears = async () => {
  return await prisma.financialYear.findMany({
    orderBy: { fromDate: 'desc' },
  });
};

export const getFinancialYearById = async (id: string) => {
  return await prisma.financialYear.findUnique({
    where: { id },
  });
};

// A financial year must end after it starts, must not overlap another year, and needs a unique name
const assertValidYear = async (name: string, fromDate: Date, toDate: Date, excludeId?: string) => {
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) throw new Error('Invalid from/to date');
  if (fromDate >= toDate) throw new Error('From date must be before To date');

  const others = excludeId ? { id: { not: excludeId } } : {};
  const sameName = await prisma.financialYear.findFirst({ where: { ...others, name } });
  if (sameName) throw new Error(`A financial year named "${name}" already exists`);

  const overlapping = await prisma.financialYear.findFirst({
    where: { ...others, fromDate: { lte: toDate }, toDate: { gte: fromDate } },
  });
  if (overlapping) throw new Error(`Dates overlap with financial year "${overlapping.name}"`);
};

export const createFinancialYear = async (data: { name: string; fromDate: string; toDate: string; currentYear?: boolean }) => {
  await assertValidYear(data.name, new Date(data.fromDate), new Date(data.toDate));

  if (data.currentYear) {
    // If setting to active, deactivate all others
    await prisma.financialYear.updateMany({
      where: { currentYear: true },
      data: { currentYear: false },
    });
  }

  return await prisma.financialYear.create({
    data: {
      name: data.name,
      fromDate: new Date(data.fromDate),
      toDate: new Date(data.toDate),
      currentYear: data.currentYear || false,
    },
  });
};

export const updateFinancialYear = async (id: string, data: any) => {
  const existing = await prisma.financialYear.findUnique({ where: { id } });
  if (!existing) throw new Error('Financial year not found');
  await assertValidYear(
    data.name ?? existing.name,
    data.fromDate ? new Date(data.fromDate) : existing.fromDate,
    data.toDate ? new Date(data.toDate) : existing.toDate,
    id
  );

  if (data.currentYear) {
    // If setting to active, deactivate all others
    await prisma.financialYear.updateMany({
      where: { currentYear: true, id: { not: id } },
      data: { currentYear: false },
    });
  }

  const updateData: any = { ...data };
  if (data.fromDate) updateData.fromDate = new Date(data.fromDate);
  if (data.toDate) updateData.toDate = new Date(data.toDate);

  return await prisma.financialYear.update({
    where: { id },
    data: updateData,
  });
};

export const deleteFinancialYear = async (id: string) => {
  const fy = await prisma.financialYear.findUnique({ where: { id } });
  if (fy?.currentYear) {
    throw new Error('Cannot delete the active financial year.');
  }

  return await prisma.financialYear.delete({
    where: { id },
  });
};

export const toggleActiveStatus = async (id: string) => {
  // Deactivate all
  await prisma.financialYear.updateMany({
    where: { currentYear: true },
    data: { currentYear: false },
  });

  // Activate the requested one
  return await prisma.financialYear.update({
    where: { id },
    data: { currentYear: true },
  });
};
