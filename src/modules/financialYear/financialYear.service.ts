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

export const createFinancialYear = async (data: { name: string; fromDate: string; toDate: string; currentYear?: boolean }) => {
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
