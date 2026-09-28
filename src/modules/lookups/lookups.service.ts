import { z } from 'zod';
import prisma from '../../core/prisma';
import { notFoundError } from '../../core/http';

const status = z.enum(['Active', 'Inactive']);
const toggled = (s: string) => (s === 'Active' ? 'Inactive' : 'Active');

// ---------- UOM ----------

export const uomSchema = z.object({
  name: z.string({ error: 'UOM name is required' }).trim().min(1, 'UOM name is required'),
  status: status.optional(),
});

const assertUomFree = async (name: string, excludeId?: string) => {
  const clash = await prisma.uom.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (clash) throw new Error('UOM name already exists.');
};

export const listUoms = () => prisma.uom.findMany({ orderBy: { name: 'asc' } });

export const createUom = async (input: unknown) => {
  const data = uomSchema.parse(input);
  await assertUomFree(data.name);
  return prisma.uom.create({ data });
};

export const updateUom = async (id: string, input: unknown) => {
  const data = uomSchema.partial().parse(input);
  const current = await prisma.uom.findUnique({ where: { id } });
  if (!current) throw notFoundError('UOM not found');
  if (data.name) await assertUomFree(data.name, id);
  return prisma.$transaction(async (tx) => {
    const uom = await tx.uom.update({ where: { id }, data });
    // Items store the UOM by name; keep them in step with a rename
    if (data.name && data.name !== current.name) {
      await tx.item.updateMany({ where: { uom: current.name }, data: { uom: data.name } });
    }
    return uom;
  });
};

export const toggleUom = async (id: string) => {
  const current = await prisma.uom.findUnique({ where: { id } });
  if (!current) throw notFoundError('UOM not found');
  return prisma.uom.update({ where: { id }, data: { status: toggled(current.status) } });
};

export const deleteUom = async (id: string) => {
  const current = await prisma.uom.findUnique({ where: { id } });
  if (!current) throw notFoundError('UOM not found');
  const used = await prisma.item.count({ where: { uom: current.name } });
  if (used > 0) throw new Error(`Cannot delete: ${used} items use this UOM.`);
  return prisma.uom.delete({ where: { id } });
};

// ---------- GST rates ----------

export const gstRateSchema = z.object({
  name: z.enum(['CGST', 'SGST', 'IGST'], { error: 'Select a GST type' }),
  rate: z.number({ error: 'GST rate is required' }).min(0, 'GST rate must be between 0 and 100').max(100, 'GST rate must be between 0 and 100'),
  status: status.optional(),
});

const assertGstFree = async (name: string, rate: number, excludeId?: string) => {
  const clash = await prisma.gstRate.findFirst({ where: { name, rate, ...(excludeId ? { id: { not: excludeId } } : {}) } });
  if (clash) throw new Error(`${name} ${rate}% already exists.`);
};

export const listGstRates = () => prisma.gstRate.findMany({ orderBy: [{ name: 'asc' }, { rate: 'asc' }] });

export const createGstRate = async (input: unknown) => {
  const data = gstRateSchema.parse(input);
  await assertGstFree(data.name, data.rate);
  return prisma.gstRate.create({ data });
};

export const updateGstRate = async (id: string, input: unknown) => {
  const data = gstRateSchema.partial().parse(input);
  const current = await prisma.gstRate.findUnique({ where: { id } });
  if (!current) throw notFoundError('GST rate not found');
  await assertGstFree(data.name ?? current.name, data.rate ?? current.rate, id);
  return prisma.gstRate.update({ where: { id }, data });
};

export const toggleGstRate = async (id: string) => {
  const current = await prisma.gstRate.findUnique({ where: { id } });
  if (!current) throw notFoundError('GST rate not found');
  return prisma.gstRate.update({ where: { id }, data: { status: toggled(current.status) } });
};

export const deleteGstRate = (id: string) => prisma.gstRate.delete({ where: { id } });

// ---------- Organisation settings (single row printed on invoices and certificates) ----------

const text = z.string().trim().max(500).optional();
export const settingsSchema = z.object({
  name: text,
  shortName: text,
  registeredAddress: text,
  rangeAddress: text,
  city: text,
  phone: text,
  email: z.string().trim().email('Invalid email').or(z.literal('')).optional(),
  website: text,
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^([A-Z]{5}[0-9]{4}[A-Z])?$/, 'PAN must look like AAAAA9999A')
    .optional(),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^([0-9]{2}[A-Z0-9]{13})?$/, 'GSTIN must be 15 characters (e.g. 24AAAAA9999A1Z5)')
    .optional(),
  areaValidity: text,
  goodsDeliveredAt: text,
  signatoryName: text,
  signatoryRole: text,
  trainerName: text,
  presidentName: text,
});

export const getSettings = async () =>
  (await prisma.organisationSetting.findUnique({ where: { id: 'default' } })) ??
  prisma.organisationSetting.create({ data: { id: 'default' } });

export const updateSettings = async (input: unknown) => {
  const data = settingsSchema.parse(input);
  await getSettings();
  return prisma.organisationSetting.update({ where: { id: 'default' }, data });
};
