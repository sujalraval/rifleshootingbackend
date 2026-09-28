import { z } from 'zod';

const optionalText = z.string().trim().nullish().transform((v) => (v ? v : null));
const date = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .min(1, `${label} is required`)
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), `${label} is invalid`);
const id = (label: string) => z.string({ error: `${label} is required` }).uuid(`${label} is required`);
const quantity = z.number({ error: 'Quantity is required' }).int('Quantity must be a whole number').positive('Quantity must be at least 1');
const money = z.number().nonnegative('Amounts cannot be negative').default(0);

const serialRule = (line: { serialNumber: string | null; quantity: number }) => !line.serialNumber || line.quantity === 1;
const serialMessage = { message: 'A line with a serial number must have quantity 1', path: ['quantity'] };

// ---------- Inward (purchase into an institute) ----------
const inwardLine = z
  .object({
    itemId: id('Item'),
    quantity,
    serialNumber: optionalText,
    costPrice: money,
    gstRate: z.number().min(0).max(100).default(0),
  })
  .refine(serialRule, serialMessage);

export const inwardSchema = z.object({
  branchId: id('Institute'),
  inwardDate: date('Inward date'),
  vendorName: optionalText,
  description: optionalText,
  receipt: optionalText,
  lines: z.array(inwardLine).min(1, 'Add at least one item'),
});
export type InwardInput = z.infer<typeof inwardSchema>;

// ---------- Outward (transfer to another institute) ----------
const outwardLine = z
  .object({
    itemId: id('Item'),
    quantity,
    serialNumber: optionalText,
    costPrice: money,
    sellingPrice: money,
    usagePrice: money,
  })
  .refine(serialRule, serialMessage);

export const outwardSchema = z
  .object({
    fromBranchId: id('From institute'),
    toBranchId: id('To institute'),
    outwardDate: date('Outward date'),
    description: optionalText,
    receipt: optionalText,
    lines: z.array(outwardLine).min(1, 'Add at least one item'),
  })
  .refine((d) => d.fromBranchId !== d.toBranchId, { message: 'An outward must go to a different institute', path: ['toBranchId'] });
export type OutwardInput = z.infer<typeof outwardSchema>;

// Receiving institute confirms (ticked lines are received) or rejects the whole shipment
export const confirmOutwardSchema = z.object({
  action: z.enum(['Confirm', 'Reject']),
  notes: optionalText,
  receivedReceipt: optionalText,
  lines: z
    .array(z.object({ id: id('Line'), confirmed: z.boolean(), instituteSerialNumber: optionalText }))
    .default([]),
}).refine((d) => d.action === 'Confirm' || !!d.notes, { message: 'Enter the reason for rejecting', path: ['notes'] });
export type ConfirmOutwardInput = z.infer<typeof confirmOutwardSchema>;

// ---------- Return (send items back to another institute) ----------
const returnLine = z
  .object({ itemId: id('Item'), quantity, serialNumber: optionalText })
  .refine(serialRule, serialMessage);

export const returnSchema = z
  .object({
    fromBranchId: id('Return from'),
    toBranchId: id('Return to'),
    returnDate: date('Return date'),
    description: optionalText,
    lines: z.array(returnLine).min(1, 'Add at least one item'),
  })
  .refine((d) => d.fromBranchId !== d.toBranchId, { message: 'Return must go to a different institute', path: ['toBranchId'] });
export type ReturnInput = z.infer<typeof returnSchema>;

export const confirmReturnSchema = z.object({
  confirmedDate: date('Received date'),
  rejectedReason: optionalText,
  notes: optionalText,
  lines: z.array(z.object({ id: id('Line'), confirmed: z.boolean() })).min(1),
});
export type ConfirmReturnInput = z.infer<typeof confirmReturnSchema>;

// ---------- Discard ----------
export const discardSchema = z
  .object({
    branchId: id('Institute'),
    itemId: id('Item'),
    discardDate: date('Discard date'),
    quantity,
    serialNumber: optionalText,
    reason: z.string({ error: 'Reason is required' }).trim().min(1, 'Reason is required'),
  })
  .refine(serialRule, serialMessage);
export type DiscardInput = z.infer<typeof discardSchema>;

// ---------- Sale ----------
export const saleSchema = z
  .object({
    branchId: id('Institute'),
    itemId: id('Item'),
    saleDate: date('Sale date'),
    soldTo: z.enum(['Member', 'Guest']),
    partyCode: z.string({ error: 'Select the buyer' }).trim().min(1, 'Select the buyer'),
    quantity,
    serialNumber: optionalText,
    discount: money,
    gstRate: z.number().min(0).max(100),
    reverseCharges: money,
    paymentMethod: z.string({ error: 'Select a payment method' }).trim().min(1, 'Select a payment method'),
    paymentInfo: optionalText,
    address: optionalText,
    gstin: optionalText,
    pan: optionalText,
    licenceNo: optionalText,
    uin: optionalText,
    areaValidity: optionalText,
    purchasePeriod: optionalText,
    validUpto: z.string().nullish().transform((v) => (v ? new Date(v) : null)),
  })
  .refine(serialRule, serialMessage);
export type SaleInput = z.infer<typeof saleSchema>;
