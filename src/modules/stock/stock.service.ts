import prisma from '../../core/prisma';
import { notFoundError } from '../../core/http';

export type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// Stock is a quantity per item per institute. Serial-numbered units are kept one row per serial
// (quantity 0 or 1); counted stock (ammunition, targets, ...) is one row per item per institute.

export interface StockLine {
  itemId: string;
  branchId: string;
  quantity: number;
  serialNumber?: string | null;
  instituteSerialNumber?: string | null;
  costPrice?: number;
  sellingPrice?: number;
  usagePrice?: number;
}

export interface StockDocument {
  type: string; // INWARD, TRANSFER_OUT, TRANSFER_IN, RETURN_OUT, RETURN_IN, DISCARD, SALE, REVERSAL
  documentType: string; // Inward, Outward, Return, Discard, Sale
  documentNo: string;
}

const clean = (serial?: string | null) => (serial && serial.trim() ? serial.trim() : null);

const itemName = async (tx: Tx, itemId: string) =>
  (await tx.item.findUnique({ where: { id: itemId }, select: { name: true } }))?.name ?? 'item';

const findUnit = (tx: Tx, line: StockLine) =>
  tx.stockUnit.findFirst({
    where: { itemId: line.itemId, branchId: line.branchId, serialNumber: clean(line.serialNumber) },
  });

const record = (tx: Tx, stockUnitId: string, quantity: number, doc: StockDocument) =>
  tx.stockMovement.create({ data: { stockUnitId, quantity, type: doc.type, documentType: doc.documentType, documentNo: doc.documentNo } });

/** Adds stock at an institute (inward, confirmed transfer, confirmed return, reversal). */
export const addStock = async (tx: Tx, line: StockLine, doc: StockDocument) => {
  const serialNumber = clean(line.serialNumber);
  if (!Number.isInteger(line.quantity) || line.quantity <= 0) throw new Error('Quantity must be a whole number greater than 0');
  if (serialNumber && line.quantity !== 1) throw new Error(`Serial number ${serialNumber}: quantity must be 1`);

  const prices = {
    ...(line.costPrice ? { costPrice: line.costPrice } : {}),
    ...(line.sellingPrice ? { sellingPrice: line.sellingPrice } : {}),
    ...(line.usagePrice ? { usagePrice: line.usagePrice } : {}),
    ...(clean(line.instituteSerialNumber) ? { instituteSerialNumber: clean(line.instituteSerialNumber) } : {}),
  };

  const existing = await findUnit(tx, line);
  if (existing) {
    if (serialNumber && existing.quantity > 0) {
      throw new Error(`Serial number ${serialNumber} of ${await itemName(tx, line.itemId)} is already in stock at this institute`);
    }
    const unit = await tx.stockUnit.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + line.quantity, ...prices },
    });
    await record(tx, unit.id, line.quantity, doc);
    return unit;
  }
  const unit = await tx.stockUnit.create({
    data: { itemId: line.itemId, branchId: line.branchId, serialNumber, quantity: line.quantity, ...prices },
  });
  await record(tx, unit.id, line.quantity, doc);
  return unit;
};

/** Takes stock out of an institute (transfer out, return out, discard, sale). Fails if not enough. */
export const removeStock = async (tx: Tx, line: StockLine, doc: StockDocument) => {
  const serialNumber = clean(line.serialNumber);
  if (!Number.isInteger(line.quantity) || line.quantity <= 0) throw new Error('Quantity must be a whole number greater than 0');
  if (serialNumber && line.quantity !== 1) throw new Error(`Serial number ${serialNumber}: quantity must be 1`);

  const unit = await findUnit(tx, line);
  const available = unit?.quantity ?? 0;
  if (available < line.quantity) {
    const what = serialNumber ? `Serial number ${serialNumber} of ${await itemName(tx, line.itemId)} is not in stock` : `Only ${available} ${await itemName(tx, line.itemId)} in stock`;
    throw new Error(`${what} at this institute`);
  }
  const updated = await tx.stockUnit.update({ where: { id: unit!.id }, data: { quantity: available - line.quantity } });
  await record(tx, updated.id, -line.quantity, doc);
  return updated;
};

// ---------- Queries used by the screens ----------

const unitInclude = {
  item: { select: { id: true, name: true, uom: true, category: { select: { name: true } }, subCategory: { select: { name: true } } } },
  branch: { select: { id: true, code: true, name: true } },
};

/** Stock rows, optionally filtered; `inStockOnly` hides rows with quantity 0. */
export const listStock = (filter: { itemId?: string; branchId?: string; inStockOnly?: boolean }) =>
  prisma.stockUnit.findMany({
    where: {
      ...(filter.itemId ? { itemId: filter.itemId } : {}),
      ...(filter.branchId ? { branchId: filter.branchId } : {}),
      ...(filter.inStockOnly ? { quantity: { gt: 0 } } : {}),
    },
    include: unitInclude,
    orderBy: [{ branch: { code: 'asc' } }, { serialNumber: 'asc' }],
  });

export const priceHistory = async (stockUnitId: string) => {
  const unit = await prisma.stockUnit.findUnique({ where: { id: stockUnitId } });
  if (!unit) throw notFoundError('Stock record not found');
  return prisma.stockPriceHistory.findMany({ where: { stockUnitId }, orderBy: { createdAt: 'desc' } });
};

export const updatePrices = (stockUnitId: string, input: { sellingPrice: number; usagePrice: number; wefDate: Date }, changedBy?: string) =>
  prisma.$transaction(async (tx) => {
    const unit = await tx.stockUnit.findUnique({ where: { id: stockUnitId } });
    if (!unit) throw notFoundError('Stock record not found');
    await tx.stockPriceHistory.create({
      data: { stockUnitId, sellingPrice: input.sellingPrice, usagePrice: input.usagePrice, wefDate: input.wefDate, changedBy },
    });
    return tx.stockUnit.update({
      where: { id: stockUnitId },
      data: { sellingPrice: input.sellingPrice, usagePrice: input.usagePrice },
      include: unitInclude,
    });
  });

export const movements = (stockUnitId: string) =>
  prisma.stockMovement.findMany({ where: { stockUnitId }, orderBy: { createdAt: 'desc' } });
