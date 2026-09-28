import prisma, { rawPrisma } from '../../core/prisma';
import { notFoundError } from '../../core/http';

export const findAll = async () => {
  return await prisma.issueItemRecord.findMany({
    include: { items: { where: { isDeleted: false } } },
    orderBy: { issueDate: 'desc' }
  });
};

export const findById = async (id: string) => {
  const issue = await prisma.issueItemRecord.findUnique({
    where: { id },
    include: { items: { where: { isDeleted: false } } }
  });
  if (!issue) throw notFoundError('Issue record not found');
  return issue;
};

// Sequential issue numbers ISS000001, ISS000002, ... (deleted records keep their number)
const nextIssueId = async () => {
  const rows = await rawPrisma.issueItemRecord.findMany({ where: { issueId: { startsWith: 'ISS' } }, select: { issueId: true } });
  const max = rows.reduce((m, r) => Math.max(m, Number(/^ISS(\d+)/.exec(r.issueId)?.[1] ?? 0)), 0);
  return `ISS${String(max + 1).padStart(6, '0')}`;
};

export const create = async (data: any) => {
  const { items, ...recordData } = data;
  const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  // Use Prisma Transaction to ensure both the Record and Details save together
  return await prisma.$transaction(async (tx) => {
    const issueRecord = await tx.issueItemRecord.create({
      data: { ...recordData, issueId: await nextIssueId(), totalQuantity }
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
      include: { items: { where: { isDeleted: false } } }
    });
  });
};

export const remove = async (id: string) => {
  // Soft delete does not trigger the database cascade, so mark the item details deleted too
  return await prisma.$transaction(async (tx) => {
    const record = await tx.issueItemRecord.delete({ where: { id } });
    await tx.issueItemDetail.deleteMany({ where: { issueRecordId: id } });
    return record;
  });
};
