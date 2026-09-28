import { Prisma, PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

// String @unique columns per model (e.g. User.email, Branch.code), read from the Prisma schema.
// On soft delete these get a suffix so the value can be reused by a new record.
const UNIQUE_STRING_FIELDS: Record<string, string[]> = Object.fromEntries(
  Prisma.dmmf.datamodel.models.map((model) => [
    model.name,
    model.fields.filter((f) => f.isUnique && !f.isId && f.type === 'String').map((f) => f.name),
  ])
);

const softDeleteData = async (model: string, where: any) => {
  const deletedAt = new Date();
  const data: Record<string, any> = { isDeleted: true, deletedAt };
  const uniqueFields = UNIQUE_STRING_FIELDS[model] || [];
  if (uniqueFields.length === 0) return [{ where, data }];

  // Each row needs its own suffixed values, so load the rows being deleted first
  const delegate = (prismaClient as any)[model];
  const rows = await delegate.findMany({
    where: { ...where, isDeleted: false },
    select: Object.fromEntries(['id', ...uniqueFields].map((f) => [f, true])),
  });
  return rows.map((row: any) => {
    const rowData = { ...data };
    for (const field of uniqueFields) {
      if (row[field] != null) rowData[field] = `${row[field]}__deleted_${deletedAt.getTime()}`;
    }
    return { where: { id: row.id }, data: rowData };
  });
};

const notDeleted = (args: any) => ({ ...args, where: { ...args?.where, isDeleted: false } });

const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      async delete({ model, args }) {
        const delegate = (prismaClient as any)[model];
        const [update] = await softDeleteData(model, args.where);
        if (!update) {
          // Keep Prisma's usual "record not found" behaviour
          return delegate.update({ ...args, data: { isDeleted: true, deletedAt: new Date() } });
        }
        return delegate.update({ ...args, where: update.where, data: update.data });
      },
      async deleteMany({ model, args }) {
        const delegate = (prismaClient as any)[model];
        const updates = await softDeleteData(model, args.where);
        if (updates.length === 1 && updates[0].where === args.where) {
          return delegate.updateMany({ where: args.where, data: updates[0].data });
        }
        for (const update of updates) await delegate.update(update);
        return { count: updates.length };
      },
      // Prisma 5 accepts extra non-unique filters in findUnique's where, so these can go
      // through query() and stay inside the caller's transaction.
      async findUnique({ args, query }) {
        return query(notDeleted(args));
      },
      async findUniqueOrThrow({ args, query }) {
        return query(notDeleted(args));
      },
      async findMany({ args, query }) {
        return query(notDeleted(args));
      },
      async findFirst({ args, query }) {
        return query(notDeleted(args));
      },
      async findFirstOrThrow({ args, query }) {
        return query(notDeleted(args));
      },
      async count({ args, query }) {
        return query(notDeleted(args));
      },
      async aggregate({ args, query }) {
        return query(notDeleted(args));
      },
      async groupBy({ args, query }) {
        return query(notDeleted(args));
      },
    },
  },
});

export { prismaClient as rawPrisma };
export default prisma;
