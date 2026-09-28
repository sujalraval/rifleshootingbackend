import prisma from '../../core/prisma';
import { notFoundError } from '../../core/http';
import { nextNumber, withNumberRetry } from '../../core/sequence';
import { addStock, removeStock, Tx } from './stock.service';
import { resolveParty } from './party';
import {
  ConfirmOutwardInput,
  ConfirmReturnInput,
  DiscardInput,
  InwardInput,
  OutwardInput,
  ReturnInput,
  SaleInput,
} from './stockDocuments.schema';

const round2 = (n: number) => Math.round(n * 100) / 100;

const assertBranch = async (tx: Tx, id: string, label: string) => {
  const branch = await tx.branch.findUnique({ where: { id } });
  if (!branch) throw new Error(`${label} does not exist`);
  return branch;
};

const itemRef = { select: { id: true, name: true, uom: true, category: { select: { name: true } }, subCategory: { select: { name: true } } } };
const branchRef = { select: { id: true, code: true, name: true } };

// ================= Inward: purchase from a vendor into an institute =================

const inwardInclude = { branch: branchRef, lines: { where: { isDeleted: false }, include: { item: itemRef } } };

const applyInwardLines = async (tx: Tx, inwardId: string, inwardNo: string, branchId: string, lines: InwardInput['lines']) => {
  for (const line of lines) {
    await tx.inwardLine.create({
      data: {
        inwardId,
        itemId: line.itemId,
        quantity: line.quantity,
        serialNumber: line.serialNumber,
        costPrice: line.costPrice,
        gstRate: line.gstRate,
        gstValue: round2((line.costPrice * line.gstRate) / 100),
      },
    });
    await addStock(tx, { ...line, branchId }, { type: 'INWARD', documentType: 'Inward', documentNo: inwardNo });
  }
};

// Undo an inward's stock (edit or delete); fails if some of it has already been moved/sold
const reverseInwardLines = async (tx: Tx, inward: { id: string; inwardNo: string; branchId: string }) => {
  const lines = await tx.inwardLine.findMany({ where: { inwardId: inward.id } });
  for (const line of lines) {
    await removeStock(tx, { ...line, branchId: inward.branchId }, { type: 'REVERSAL', documentType: 'Inward', documentNo: inward.inwardNo });
  }
  await tx.inwardLine.deleteMany({ where: { inwardId: inward.id } });
};

export const listInwards = (branchId?: string) =>
  prisma.inwardEntry.findMany({ where: branchId ? { branchId } : {}, include: inwardInclude, orderBy: { createdAt: 'desc' } });

export const createInward = (input: InwardInput) =>
  withNumberRetry(() =>
    prisma.$transaction(async (tx) => {
      await assertBranch(tx, input.branchId, 'Institute');
      const { lines, ...header } = input;
      const inward = await tx.inwardEntry.create({ data: { ...header, inwardNo: await nextNumber('inwardEntry', 'inwardNo', 'INW') } });
      await applyInwardLines(tx, inward.id, inward.inwardNo, input.branchId, lines);
      return tx.inwardEntry.findUnique({ where: { id: inward.id }, include: inwardInclude });
    })
  );

export const updateInward = (id: string, input: InwardInput) =>
  prisma.$transaction(async (tx) => {
    const current = await tx.inwardEntry.findUnique({ where: { id } });
    if (!current) throw notFoundError('Inward entry not found');
    await assertBranch(tx, input.branchId, 'Institute');
    await reverseInwardLines(tx, current);
    const { lines, ...header } = input;
    await tx.inwardEntry.update({ where: { id }, data: header });
    await applyInwardLines(tx, id, current.inwardNo, input.branchId, lines);
    return tx.inwardEntry.findUnique({ where: { id }, include: inwardInclude });
  });

export const deleteInward = (id: string) =>
  prisma.$transaction(async (tx) => {
    const current = await tx.inwardEntry.findUnique({ where: { id } });
    if (!current) throw notFoundError('Inward entry not found');
    await reverseInwardLines(tx, current);
    return tx.inwardEntry.delete({ where: { id } });
  });

// ================= Outward: transfer to another institute =================

const outwardInclude = {
  fromBranch: branchRef,
  toBranch: branchRef,
  lines: { where: { isDeleted: false }, include: { item: itemRef } },
  returns: { where: { isDeleted: false }, select: { id: true, returnNo: true, status: true } },
};

const takeOutwardStock = async (tx: Tx, outwardId: string, outwardNo: string, input: OutwardInput) => {
  for (const line of input.lines) {
    await removeStock(tx, { ...line, branchId: input.fromBranchId }, { type: 'TRANSFER_OUT', documentType: 'Outward', documentNo: outwardNo });
    await tx.outwardLine.create({ data: { ...line, outwardId } });
  }
};

const giveBackOutwardStock = async (tx: Tx, outward: { id: string; outwardNo: string; fromBranchId: string }) => {
  const lines = await tx.outwardLine.findMany({ where: { outwardId: outward.id } });
  for (const line of lines) {
    await addStock(tx, { ...line, branchId: outward.fromBranchId }, { type: 'REVERSAL', documentType: 'Outward', documentNo: outward.outwardNo });
  }
  await tx.outwardLine.deleteMany({ where: { outwardId: outward.id } });
};

/** `direction`: 'sent' = outwards from the institute, 'incoming' = outwards to it (Confirm Inward). */
export const listOutwards = (filter: { branchId?: string; direction?: 'sent' | 'incoming'; status?: string }) =>
  prisma.outwardEntry.findMany({
    where: {
      ...(filter.branchId && filter.direction === 'incoming' ? { toBranchId: filter.branchId } : {}),
      ...(filter.branchId && filter.direction !== 'incoming' ? { fromBranchId: filter.branchId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    },
    include: outwardInclude,
    orderBy: { createdAt: 'desc' },
  });

export const createOutward = (input: OutwardInput) =>
  withNumberRetry(() =>
    prisma.$transaction(async (tx) => {
      await assertBranch(tx, input.fromBranchId, 'From institute');
      await assertBranch(tx, input.toBranchId, 'To institute');
      const { lines, ...header } = input;
      const outward = await tx.outwardEntry.create({ data: { ...header, outwardNo: await nextNumber('outwardEntry', 'outwardNo', 'OUT') } });
      await takeOutwardStock(tx, outward.id, outward.outwardNo, input);
      return tx.outwardEntry.findUnique({ where: { id: outward.id }, include: outwardInclude });
    })
  );

const pendingOutward = async (tx: Tx, id: string) => {
  const outward = await tx.outwardEntry.findUnique({ where: { id } });
  if (!outward) throw notFoundError('Outward entry not found');
  if (outward.status !== 'Pending') throw new Error(`This outward is already ${outward.status.toLowerCase()} and cannot be changed`);
  return outward;
};

export const updateOutward = (id: string, input: OutwardInput) =>
  prisma.$transaction(async (tx) => {
    const current = await pendingOutward(tx, id);
    await assertBranch(tx, input.fromBranchId, 'From institute');
    await assertBranch(tx, input.toBranchId, 'To institute');
    await giveBackOutwardStock(tx, current);
    const { lines, ...header } = input;
    await tx.outwardEntry.update({ where: { id }, data: header });
    await takeOutwardStock(tx, id, current.outwardNo, input);
    return tx.outwardEntry.findUnique({ where: { id }, include: outwardInclude });
  });

export const deleteOutward = (id: string) =>
  prisma.$transaction(async (tx) => {
    const current = await pendingOutward(tx, id);
    await giveBackOutwardStock(tx, current);
    return tx.outwardEntry.delete({ where: { id } });
  });

/**
 * The receiving institute confirms an outward: ticked lines go into its stock; anything not received
 * (or the whole shipment on Reject) automatically becomes a pending return to the sending institute.
 */
export const confirmOutward = (id: string, input: ConfirmOutwardInput, userName?: string) =>
  withNumberRetry(() =>
    prisma.$transaction(async (tx) => {
      const outward = await pendingOutward(tx, id);
      const lines = await tx.outwardLine.findMany({ where: { outwardId: id } });
      const decisions = new Map(input.lines.map((l) => [l.id, l]));
      const received = input.action === 'Confirm' ? lines.filter((l) => decisions.get(l.id)?.confirmed) : [];
      if (input.action === 'Confirm' && received.length === 0) throw new Error('Tick at least one received item, or reject the shipment');

      for (const line of lines) {
        const decision = decisions.get(line.id);
        const isReceived = received.includes(line);
        const instituteSerialNumber = isReceived ? decision?.instituteSerialNumber ?? line.serialNumber : null;
        await tx.outwardLine.update({ where: { id: line.id }, data: { confirmed: isReceived, instituteSerialNumber } });
        if (isReceived) {
          await addStock(
            tx,
            { ...line, branchId: outward.toBranchId, instituteSerialNumber },
            { type: 'TRANSFER_IN', documentType: 'Outward', documentNo: outward.outwardNo }
          );
        }
      }

      const notReceived = lines.filter((l) => !received.includes(l));
      if (notReceived.length > 0) {
        await tx.returnEntry.create({
          data: {
            returnNo: await nextNumber('returnEntry', 'returnNo', 'RET'),
            returnDate: new Date(),
            type: 'Rejected',
            description: input.notes ?? `Not received from outward ${outward.outwardNo}`,
            returnedBy: userName,
            fromBranchId: outward.toBranchId,
            toBranchId: outward.fromBranchId,
            outwardId: outward.id,
            lines: {
              create: notReceived.map((l) => ({
                itemId: l.itemId,
                quantity: l.quantity,
                serialNumber: l.serialNumber,
                sellingPrice: l.sellingPrice,
                usagePrice: l.usagePrice,
              })),
            },
          },
        });
      }

      return tx.outwardEntry.update({
        where: { id },
        data: {
          status: received.length > 0 ? 'Confirmed' : 'Rejected',
          receivedDate: new Date(),
          receivedReceipt: input.receivedReceipt,
          confirmationDescription: input.notes,
          confirmedBy: userName,
        },
        include: outwardInclude,
      });
    })
  );

// ================= Returns: items sent back to an institute =================

const returnInclude = {
  fromBranch: branchRef,
  toBranch: branchRef,
  outward: { select: { id: true, outwardNo: true } },
  lines: { where: { isDeleted: false }, include: { item: itemRef } },
};

export const listReturns = (filter: { branchId?: string; direction?: 'sent' | 'incoming'; status?: string; type?: string }) =>
  prisma.returnEntry.findMany({
    where: {
      ...(filter.branchId && filter.direction === 'incoming' ? { toBranchId: filter.branchId } : {}),
      ...(filter.branchId && filter.direction !== 'incoming' ? { fromBranchId: filter.branchId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.type ? { type: filter.type } : {}),
    },
    include: returnInclude,
    orderBy: { createdAt: 'desc' },
  });

export const createReturn = (input: ReturnInput, userName?: string) =>
  withNumberRetry(() =>
    prisma.$transaction(async (tx) => {
      await assertBranch(tx, input.fromBranchId, 'Return from');
      await assertBranch(tx, input.toBranchId, 'Return to');
      const returnNo = await nextNumber('returnEntry', 'returnNo', 'RET');
      const lines = [];
      for (const line of input.lines) {
        const unit = await removeStock(tx, { ...line, branchId: input.fromBranchId }, { type: 'RETURN_OUT', documentType: 'Return', documentNo: returnNo });
        lines.push({ ...line, instituteSerialNumber: unit.instituteSerialNumber, sellingPrice: unit.sellingPrice, usagePrice: unit.usagePrice });
      }
      const { lines: _lines, ...header } = input;
      return tx.returnEntry.create({
        data: { ...header, returnNo, type: 'Returned', returnedBy: userName, lines: { create: lines } },
        include: returnInclude,
      });
    })
  );

/** The receiving institute confirms a return: ticked lines go back into its stock; unticked ones were not received. */
export const confirmReturn = (id: string, input: ConfirmReturnInput, userName?: string) =>
  prisma.$transaction(async (tx) => {
    const entry = await tx.returnEntry.findUnique({ where: { id } });
    if (!entry) throw notFoundError('Return not found');
    if (entry.status !== 'Pending') throw new Error('This return has already been confirmed');
    const lines = await tx.returnLine.findMany({ where: { returnId: id } });
    const decisions = new Map(input.lines.map((l) => [l.id, l.confirmed]));
    const notReceived = lines.filter((l) => !decisions.get(l.id));
    if (notReceived.length > 0 && !input.rejectedReason) throw new Error('Select why some items were not accepted');

    for (const line of lines) {
      const accepted = !!decisions.get(line.id);
      await tx.returnLine.update({ where: { id: line.id }, data: { confirmed: accepted } });
      if (accepted) {
        await addStock(tx, { ...line, branchId: entry.toBranchId }, { type: 'RETURN_IN', documentType: 'Return', documentNo: entry.returnNo });
      }
    }
    return tx.returnEntry.update({
      where: { id },
      data: {
        status: 'Confirmed',
        confirmedDate: input.confirmedDate,
        confirmedBy: userName,
        rejectedReason: notReceived.length > 0 ? input.rejectedReason : null,
        confirmNotes: input.notes,
      },
      include: returnInclude,
    });
  });

// ================= Discard =================

const discardInclude = { item: itemRef, branch: branchRef };

export const listDiscards = (branchId?: string) =>
  prisma.discardEntry.findMany({ where: branchId ? { branchId } : {}, include: discardInclude, orderBy: { createdAt: 'desc' } });

export const createDiscard = (input: DiscardInput) =>
  withNumberRetry(() =>
    prisma.$transaction(async (tx) => {
      const discardNo = await nextNumber('discardEntry', 'discardNo', 'DIS');
      const unit = await removeStock(tx, input, { type: 'DISCARD', documentType: 'Discard', documentNo: discardNo });
      return tx.discardEntry.create({
        data: { ...input, discardNo, instituteSerialNumber: unit.instituteSerialNumber },
        include: discardInclude,
      });
    })
  );

// ================= Sale =================

const saleInclude = { item: itemRef, branch: branchRef };

export const listSales = (branchId?: string) =>
  prisma.saleEntry.findMany({ where: branchId ? { branchId } : {}, include: saleInclude, orderBy: { createdAt: 'desc' } });

export const getSale = async (id: string) => {
  const sale = await prisma.saleEntry.findUnique({ where: { id }, include: saleInclude });
  if (!sale) throw notFoundError('Sale not found');
  return sale;
};

/** Price comes from the institute's stock (selling price); totals are calculated here, not trusted from the client. */
export const createSale = (input: SaleInput) =>
  withNumberRetry(() =>
    prisma.$transaction(async (tx) => {
      const party = await resolveParty(input.soldTo, input.partyCode);
      const invoiceNo = await nextNumber('saleEntry', 'invoiceNo', 'SAL');
      const unit = await removeStock(tx, input, { type: 'SALE', documentType: 'Sale', documentNo: invoiceNo });
      if (!unit.sellingPrice) throw new Error('This stock has no selling price. Set it in Item Master > View Stock first.');

      const rate = unit.sellingPrice;
      const amount = round2(rate * input.quantity);
      if (input.discount > amount) throw new Error(`Discount cannot exceed the amount (₹${amount})`);
      const taxableAmount = round2(amount - input.discount);
      const gstAmount = round2((taxableAmount * input.gstRate) / 100);
      const amountPayable = round2(taxableAmount + gstAmount + input.reverseCharges);

      return tx.saleEntry.create({
        data: {
          ...input,
          ...party.ids,
          name: party.name,
          address: input.address ?? party.address,
          invoiceNo,
          rate,
          amount,
          taxableAmount,
          gstAmount,
          amountPayable,
        },
        include: saleInclude,
      });
    })
  );
