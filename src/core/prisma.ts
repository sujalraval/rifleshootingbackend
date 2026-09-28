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

// Same code Prisma uses for "record not found", with a readable message
const notFound = () => Object.assign(new Error('Record not found'), { code: 'P2025' });

const softDeleteData = async (model: string, where: any) => {
  const deletedAt = new Date();
  const data: Record<string, any> = { isDeleted: true, deletedAt };
  const uniqueFields = UNIQUE_STRING_FIELDS[model] || [];
  if (uniqueFields.length === 0) return [{ where: { ...where, isDeleted: false }, data }];

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
        // Already-deleted (or missing) records are "not found"; deleting twice must not succeed
        const [update] = await softDeleteData(model, args.where);
        if (!update) throw notFound();
        try {
          return await delegate.update({ ...args, where: update.where, data: update.data });
        } catch (error: any) {
          throw error?.code === 'P2025' ? notFound() : error;
        }
      },
      async deleteMany({ model, args }) {
        const delegate = (prismaClient as any)[model];
        const updates = await softDeleteData(model, args.where);
        if ((UNIQUE_STRING_FIELDS[model] || []).length === 0) {
          return delegate.updateMany({ where: updates[0].where, data: updates[0].data });
        }
        for (const update of updates) await delegate.update(update);
        return { count: updates.length };
      },
      // Soft-deleted records cannot be modified (restore goes through rawPrisma)
      async update({ args, query }) {
        try {
          return await query(notDeleted(args));
        } catch (error: any) {
          throw error?.code === 'P2025' ? notFound() : error;
        }
      },
      async updateMany({ args, query }) {
        return query(notDeleted(args));
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
