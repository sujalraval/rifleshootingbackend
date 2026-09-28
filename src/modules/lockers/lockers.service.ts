import { z } from 'zod';
import prisma from '../../core/prisma';
import { notFoundError } from '../../core/http';
import { nextNumber, withNumberRetry } from '../../core/sequence';
import { resolveParty } from '../stock/party';

export const PERIODS = ['A Day', 'A Week', 'A Month', 'A Half Year', 'A Year'] as const;

const date = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .min(1, `${label} is required`)
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), `${label} is invalid`);

// ---------- Locker master ----------

const usageRate = z.object({
  period: z.enum(PERIODS, { error: 'Select a period' }),
  rate: z.number({ error: 'Rate is required' }).positive('Rate must be greater than 0'),
  wefDate: date('WEF date'),
});

export const lockerSchema = z.object({
  branchId: z.string({ error: 'Select an institute' }).uuid('Select an institute'),
  name: z.string({ error: 'Locker name is required' }).trim().min(1, 'Locker name is required'),
  description: z.string().trim().nullish().transform((v) => (v ? v : null)),
  gstRate: z.number({ error: 'Select a GST rate' }).min(0).max(100),
  status: z.enum(['Active', 'Inactive']).optional(),
  usageRates: z
    .array(usageRate)
    .min(1, 'Assign at least one usage rate')
    .refine((rates) => new Set(rates.map((r) => `${r.period}|${r.wefDate.toISOString()}`)).size === rates.length, 'Each period can have only one rate per WEF date'),
});

const lockerInclude = {
  branch: { select: { id: true, code: true, name: true } },
  usageRates: { where: { isDeleted: false }, orderBy: [{ period: 'asc' as const }, { wefDate: 'desc' as const }] },
};

const assertLockerNameFree = async (branchId: string, name: string, excludeId?: string) => {
  const clash = await prisma.locker.findFirst({
    where: { branchId, name: { equals: name, mode: 'insensitive' }, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (clash) throw new Error('A locker with this name already exists at this institute.');
};

/** Lockers with an `occupied` flag (an active issue covering today). */
export const listLockers = async () => {
  const lockers = await prisma.locker.findMany({ include: lockerInclude, orderBy: [{ branch: { code: 'asc' } }, { name: 'asc' }] });
  const now = new Date();
  const active = await prisma.lockerIssue.findMany({
    where: { status: 'Active', startDate: { lte: now }, endDate: { gte: now } },
    select: { lockerId: true },
  });
  const occupied = new Set(active.map((a) => a.lockerId));
  return lockers.map((l) => ({ ...l, occupied: occupied.has(l.id) }));
};

export const createLocker = async (input: unknown) => {
  const { usageRates, ...data } = lockerSchema.parse(input);
  await assertLockerNameFree(data.branchId, data.name);
  return prisma.locker.create({ data: { ...data, usageRates: { create: usageRates } }, include: lockerInclude });
};

export const updateLocker = async (id: string, input: unknown) => {
  const { usageRates, ...data } = lockerSchema.parse(input);
  const current = await prisma.locker.findUnique({ where: { id } });
  if (!current) throw notFoundError('Locker not found');
  await assertLockerNameFree(data.branchId, data.name, id);
  return prisma.$transaction(async (tx) => {
    // The rate list is replaced as a whole (the form edits it as one table)
    await tx.lockerUsageRate.deleteMany({ where: { lockerId: id } });
    return tx.locker.update({ where: { id }, data: { ...data, usageRates: { create: usageRates } }, include: lockerInclude });
  });
};

export const toggleLocker = async (id: string) => {
  const current = await prisma.locker.findUnique({ where: { id } });
  if (!current) throw notFoundError('Locker not found');
  return prisma.locker.update({ where: { id }, data: { status: current.status === 'Active' ? 'Inactive' : 'Active' }, include: lockerInclude });
};

export const deleteLocker = async (id: string) => {
  const active = await prisma.lockerIssue.count({ where: { lockerId: id, status: 'Active' } });
  if (active > 0) throw new Error('Cannot delete: this locker is currently issued.');
  return prisma.locker.delete({ where: { id } });
};

// ---------- Issue locker ----------

export const lockerIssueSchema = z
  .object({
    lockerId: z.string({ error: 'Select a locker' }).uuid('Select a locker'),
    issueDate: date('Issue date'),
    issuedTo: z.enum(['Member', 'Guest']),
    partyCode: z.string({ error: 'Select who the locker is issued to' }).trim().min(1, 'Select who the locker is issued to'),
    usagePeriod: z.enum(PERIODS, { error: 'Select a usage period' }),
    startDate: date('Start date'),
    endDate: date('End date'),
    discount: z.number().nonnegative('Discount cannot be negative').default(0),
    paymentMethod: z.string({ error: 'Select a payment method' }).trim().min(1, 'Select a payment method'),
    paymentInfo: z.string().trim().nullish().transform((v) => (v ? v : null)),
    description: z.string().trim().nullish().transform((v) => (v ? v : null)),
  })
  .refine((d) => d.endDate >= d.startDate, { message: 'End date must be on or after the start date', path: ['endDate'] });

const round2 = (n: number) => Math.round(n * 100) / 100;
const DAY_MS = 24 * 60 * 60 * 1000;

const issueInclude = { locker: { select: { id: true, name: true, branch: { select: { id: true, code: true, name: true } } } } };

export const listLockerIssues = () => prisma.lockerIssue.findMany({ include: issueInclude, orderBy: { createdAt: 'desc' } });

/** Charge = the locker's rate for the period effective on the start date; GST from the locker. */
const priceIssue = async (data: z.infer<typeof lockerIssueSchema>, excludeIssueId?: string) => {
  const locker = await prisma.locker.findUnique({ where: { id: data.lockerId }, include: lockerInclude });
  if (!locker) throw new Error('Selected locker does not exist');
  if (locker.status !== 'Active') throw new Error('Selected locker is inactive');

  const overlap = await prisma.lockerIssue.findFirst({
    where: {
      lockerId: data.lockerId,
      status: 'Active',
      startDate: { lte: data.endDate },
      endDate: { gte: data.startDate },
      ...(excludeIssueId ? { id: { not: excludeIssueId } } : {}),
    },
  });
  if (overlap) throw new Error(`Locker ${locker.name} is already issued (${overlap.issueNo}) for these dates.`);

  const rate = locker.usageRates
    .filter((r) => r.period === data.usagePeriod && r.wefDate <= data.startDate)
    .sort((a, b) => b.wefDate.getTime() - a.wefDate.getTime())[0];
  if (!rate) throw new Error(`Locker ${locker.name} has no "${data.usagePeriod}" rate effective on the start date.`);

  const amount = rate.rate;
  if (data.discount > amount) throw new Error(`Discount cannot exceed the usage charge (₹${amount})`);
  const taxableAmount = round2(amount - data.discount);
  const gstAmount = round2((taxableAmount * locker.gstRate) / 100);
  return {
    usageCharge: rate.rate,
    noOfDays: Math.round((data.endDate.getTime() - data.startDate.getTime()) / DAY_MS) + 1,
    amount,
    taxableAmount,
    gstRate: locker.gstRate,
    gstAmount,
    amountPayable: round2(taxableAmount + gstAmount),
  };
};

export const createLockerIssue = async (input: unknown) => {
  const data = lockerIssueSchema.parse(input);
  const party = await resolveParty(data.issuedTo, data.partyCode);
  const pricing = await priceIssue(data);
  return withNumberRetry(async () =>
    prisma.lockerIssue.create({
      data: { ...data, ...pricing, ...party.ids, name: party.name, issueNo: await nextNumber('lockerIssue', 'issueNo', 'LCK') },
      include: issueInclude,
    })
  );
};

export const updateLockerIssue = async (id: string, input: unknown) => {
  const current = await prisma.lockerIssue.findUnique({ where: { id } });
  if (!current) throw notFoundError('Locker issue not found');
  if (current.status !== 'Active') throw new Error('A returned locker issue cannot be edited');
  const data = lockerIssueSchema.parse(input);
  const party = await resolveParty(data.issuedTo, data.partyCode);
  const pricing = await priceIssue(data, id);
  return prisma.lockerIssue.update({
    where: { id },
    data: { ...data, ...pricing, memberId: null, s1MemberId: null, guestId: null, ...party.ids, name: party.name },
    include: issueInclude,
  });
};

/** Frees the locker (key handed back). */
export const returnLockerIssue = async (id: string) => {
  const current = await prisma.lockerIssue.findUnique({ where: { id } });
  if (!current) throw notFoundError('Locker issue not found');
  if (current.status !== 'Active') throw new Error('This locker is already returned');
  return prisma.lockerIssue.update({ where: { id }, data: { status: 'Returned', returnedAt: new Date() }, include: issueInclude });
};
