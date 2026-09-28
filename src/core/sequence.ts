import { rawPrisma } from './prisma';

/**
 * Next sequential document number such as INW000001 for a model's unique number field.
 * Deleted rows are included (numbers are never reused). Callers retry on a unique-key clash.
 */
export const nextNumber = async (model: string, field: string, prefix: string) => {
  const rows: Record<string, string>[] = await (rawPrisma as any)[model].findMany({
    where: { [field]: { startsWith: prefix } },
    select: { [field]: true },
  });
  const pattern = new RegExp(`^${prefix}(\\d+)`);
  const max = rows.reduce((m, r) => Math.max(m, Number(pattern.exec(r[field])?.[1] ?? 0)), 0);
  return `${prefix}${String(max + 1).padStart(6, '0')}`;
};

/** Runs `create` up to 3 times when two requests take the same document number at once. */
export const withNumberRetry = async <T>(create: () => Promise<T>): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await create();
    } catch (error: any) {
      if (error?.code === 'P2002' && attempt < 2) continue;
      throw error;
    }
  }
};
