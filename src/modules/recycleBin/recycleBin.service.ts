import { Prisma } from '@prisma/client';
import { rawPrisma } from '../../core/prisma';

// Soft-deleted rows carry "__deleted_<timestamp>" on their unique text fields (see core/prisma.ts)
const DELETED_SUFFIX = /__deleted_\d+$/;

// Children removed together with their parent are restored with it. Rows deleted within this
// window of the parent's deletedAt are treated as part of the same delete.
const SAME_DELETE_WINDOW_MS = 10_000;

type Entity = {
  model: string; // Prisma model name
  label: string; // shown in the UI
  title: (row: any) => string; // row description
  children?: { model: string; foreignKey: string }[];
  // Parents that must be active before this row can come back
  parents?: { model: string; foreignKey: string; label: string }[];
};

// Everything that can be deleted from the app's screens
export const ENTITIES: Record<string, Entity> = {
  member: {
    model: 'Member', label: 'Member', title: (r) => `${r.name} (${r.memberId})`,
    children: [{ model: 'MemberSubscription', foreignKey: 'memberId' }, { model: 'OutstandingCharge', foreignKey: 'memberId' }],
    parents: [{ model: 'Branch', foreignKey: 'branchId', label: 'institute' }],
  },
  s1Member: {
    model: 'S1Member', label: 'S1 Member', title: (r) => `${r.name} (${r.s1MemberId})`,
    children: [{ model: 'MemberSubscription', foreignKey: 's1MemberId' }, { model: 'OutstandingCharge', foreignKey: 's1MemberId' }],
    parents: [{ model: 'Branch', foreignKey: 'branchId', label: 'institute' }],
  },
  user: { model: 'User', label: 'System User', title: (r) => `${r.name} (${r.email})` },
  role: { model: 'Role', label: 'Role', title: (r) => r.name, children: [{ model: 'RolePermission', foreignKey: 'roleId' }] },
  branch: { model: 'Branch', label: 'Institute', title: (r) => `${r.name} (${r.code})` },
  financialYear: { model: 'FinancialYear', label: 'Financial Year', title: (r) => r.name },
  membershipName: { model: 'MembershipName', label: 'Membership Name', title: (r) => r.name },
  membershipCharge: { model: 'MembershipCharge', label: 'Membership Plan', title: (r) => `${r.name} - ${r.institute} (${r.planFor})` },
  itemCategory: { model: 'ItemCategory', label: 'Item Category', title: (r) => r.name },
  itemSubCategory: {
    model: 'ItemSubCategory', label: 'Item Sub-Category', title: (r) => r.name,
    parents: [{ model: 'ItemCategory', foreignKey: 'categoryId', label: 'category' }],
  },
  item: {
    model: 'Item', label: 'Item', title: (r) => r.name,
    parents: [
      { model: 'ItemCategory', foreignKey: 'categoryId', label: 'category' },
      { model: 'ItemSubCategory', foreignKey: 'subCategoryId', label: 'sub-category' },
    ],
  },
  guest: { model: 'Guest', label: 'Guest', title: (r) => `${r.firstName} ${r.lastName} (${r.guestId})` },
  uom: { model: 'Uom', label: 'UOM', title: (r) => r.name },
  gstRate: { model: 'GstRate', label: 'GST Rate', title: (r) => `${r.name} ${r.rate}%` },
  locker: {
    model: 'Locker', label: 'Locker', title: (r) => r.name,
    parents: [{ model: 'Branch', foreignKey: 'branchId', label: 'institute' }],
  },
  issue: {
    model: 'IssueItemRecord', label: 'Issue Record', title: (r) => `${r.issueId} - ${r.fullName}`,
    children: [{ model: 'IssueItemDetail', foreignKey: 'issueRecordId' }],
  },
};

const delegate = (model: string) => (rawPrisma as any)[model];

const uniqueTextFields = (model: string) =>
  Prisma.dmmf.datamodel.models
    .find((m) => m.name === model)!
    .fields.filter((f) => f.isUnique && !f.isId && f.type === 'String')
    .map((f) => f.name);

const stripSuffix = (row: any, model: string) => {
  const out: Record<string, any> = { ...row };
  for (const field of uniqueTextFields(model)) {
    if (typeof out[field] === 'string') out[field] = out[field].replace(DELETED_SUFFIX, '');
  }
  return out;
};

export const listDeleted = async () => {
  const groups = await Promise.all(
    Object.entries(ENTITIES).map(async ([key, entity]) => {
      const rows = await delegate(entity.model).findMany({ where: { isDeleted: true }, orderBy: { deletedAt: 'desc' }, take: 200 });
      return rows.map((row: any) => ({
        type: key,
        typeLabel: entity.label,
        id: row.id,
        title: entity.title(stripSuffix(row, entity.model)),
        deletedAt: row.deletedAt,
      }));
    })
  );
  return groups.flat().sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
};

export const restore = async (type: string, id: string) => {
  const entity = ENTITIES[type];
  if (!entity) throw new Error('Unknown record type');

  const row = await delegate(entity.model).findUnique({ where: { id } });
  if (!row || !row.isDeleted) throw Object.assign(new Error('Deleted record not found'), { code: 'P2025' });

  for (const parent of entity.parents ?? []) {
    const parentRow = row[parent.foreignKey] ? await delegate(parent.model).findUnique({ where: { id: row[parent.foreignKey] } }) : null;
    if (parentRow?.isDeleted) throw new Error(`Restore the ${parent.label} first - it is also deleted.`);
  }

  // Give back the original unique values, unless something active took them meanwhile
  const original = stripSuffix(row, entity.model);
  const uniqueData: Record<string, any> = {};
  for (const field of uniqueTextFields(entity.model)) {
    if (original[field] === row[field]) continue;
    const clash = await delegate(entity.model).findFirst({ where: { [field]: original[field], isDeleted: false } });
    if (clash) throw new Error(`Cannot restore: ${field} "${original[field]}" is now used by another record.`);
    uniqueData[field] = original[field];
  }

  return rawPrisma.$transaction(async (tx) => {
    const restored = await (tx as any)[entity.model].update({
      where: { id },
      data: { ...uniqueData, isDeleted: false, deletedAt: null },
    });
    for (const child of entity.children ?? []) {
      if (!row.deletedAt) continue;
      const from = new Date(row.deletedAt.getTime() - SAME_DELETE_WINDOW_MS);
      const to = new Date(row.deletedAt.getTime() + SAME_DELETE_WINDOW_MS);
      await (tx as any)[child.model].updateMany({
        where: { [child.foreignKey]: id, isDeleted: true, deletedAt: { gte: from, lte: to } },
        data: { isDeleted: false, deletedAt: null },
      });
    }
    return { type, id: restored.id, title: entity.title(restored) };
  });
};
