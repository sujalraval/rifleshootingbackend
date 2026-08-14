import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      async delete({ model, args, query }) {
        return prismaClient[model as any].update({
          ...args,
          data: { isDeleted: true, deletedAt: new Date() },
        });
      },
      async deleteMany({ model, args, query }) {
        return prismaClient[model as any].updateMany({
          ...args,
          data: { isDeleted: true, deletedAt: new Date() },
        });
      },
      async findMany({ model, args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      async findFirst({ model, args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      async findFirstOrThrow({ model, args, query }) {
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
      async findUnique({ model, args, query }) {
        // If findUnique has an isDeleted filter, it becomes findFirst
        const extendedArgs = { ...args, where: { ...args.where, isDeleted: false } };
        return prismaClient[model as any].findFirst(extendedArgs);
      },
      async findUniqueOrThrow({ model, args, query }) {
        const extendedArgs = { ...args, where: { ...args.where, isDeleted: false } };
        return prismaClient[model as any].findFirstOrThrow(extendedArgs);
      }
    }
  }
});

export { prismaClient as rawPrisma };
export default prisma;
