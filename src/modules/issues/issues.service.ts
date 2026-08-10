import prisma from '../../core/prisma';

export const findAll = async () => {
  return await prisma.issueItemRecord.findMany({
    include: { items: true },
    orderBy: { issueDate: 'desc' }
  });
};

export const findById = async (id: string) => {
  const issue = await prisma.issueItemRecord.findUnique({
    where: { id },
    include: { items: true }
  });
  if (!issue) throw new Error('Issue record not found');
  return issue;
};

export const create = async (data: any) => {
  const existing = await prisma.issueItemRecord.findUnique({ where: { issueId: data.issueId } });
  if (existing) throw new Error('Issue ID already exists');

  const { items, ...recordData } = data;

  // Use Prisma Transaction to ensure both the Record and Details save together
  return await prisma.$transaction(async (tx) => {
    const issueRecord = await tx.issueItemRecord.create({
      data: recordData
    });

    // Create all nested items attached to this issue
    const itemDetails = items.map((item: any) => ({
      ...item,
      issueRecordId: issueRecord.id
    }));

    await tx.issueItemDetail.createMany({
      data: itemDetails
    });

    // Note: Deducting from InventoryItem stock would go here if required by business logic.
    // e.g., for each item, tx.inventoryItem.update({ data: { quantity: { decrement: item.quantity } } })

    return await tx.issueItemRecord.findUnique({
      where: { id: issueRecord.id },
      include: { items: true }
    });
  });
};

export const remove = async (id: string) => {
  // Cascading delete is handled by Prisma schema (@relation onDelete: Cascade)
  return await prisma.issueItemRecord.delete({
    where: { id }
  });
};
