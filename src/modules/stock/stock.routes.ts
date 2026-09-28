import { Router, Request } from 'express';
import { z } from 'zod';
import { protect, AuthRequest } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES, STOCK_SCREENS } from '../../core/middlewares/authorize.middleware';
import { handle } from '../../core/http';
import * as stock from './stock.service';
import * as docs from './stockDocuments.service';
import {
  confirmOutwardSchema,
  confirmReturnSchema,
  discardSchema,
  inwardSchema,
  outwardSchema,
  returnSchema,
  saleSchema,
} from './stockDocuments.schema';

const q = (req: Request, key: string) => (typeof req.query[key] === 'string' && req.query[key] ? (req.query[key] as string) : undefined);
const id = (req: Request) => req.params.id as string;
const userName = (req: Request) => (req as AuthRequest).user?.email;
const direction = (req: Request) => (q(req, 'direction') === 'incoming' ? 'incoming' : 'sent');

// ---------- Stock levels (Item Master > View Stock, and the item pickers of every stock screen) ----------
export const stockRoutes = Router();
stockRoutes.use(protect);
stockRoutes.get('/', authorize([...MODULES.ITEM_MASTER, ...STOCK_SCREENS]), handle(200, (req) =>
  stock.listStock({ itemId: q(req, 'itemId'), branchId: q(req, 'branchId'), inStockOnly: q(req, 'inStock') === 'true' })));
stockRoutes.get('/:id/price-history', authorize(MODULES.ITEM_MASTER), handle(200, (req) => stock.priceHistory(id(req))));
stockRoutes.get('/:id/movements', authorize([...MODULES.ITEM_MASTER, ...STOCK_SCREENS]), handle(200, (req) => stock.movements(id(req))));
const priceSchema = z.object({
  sellingPrice: z.number().nonnegative('Selling price cannot be negative'),
  usagePrice: z.number().nonnegative('Usage price cannot be negative'),
  wefDate: z.string().min(1, 'WEF date is required').transform((v) => new Date(v)),
});
stockRoutes.put('/:id/prices', authorize(MODULES.ITEM_MASTER), handle(200, (req) =>
  stock.updatePrices(id(req), priceSchema.parse(req.body), userName(req))));

// ---------- Inward entries (purchase into an institute) ----------
export const inwardRoutes = Router();
inwardRoutes.use(protect, authorize(MODULES.INWARD));
inwardRoutes.get('/', handle(200, (req) => docs.listInwards(q(req, 'branchId'))));
inwardRoutes.post('/', handle(201, (req) => docs.createInward(inwardSchema.parse(req.body))));
inwardRoutes.put('/:id', handle(200, (req) => docs.updateInward(id(req), inwardSchema.parse(req.body))));
inwardRoutes.delete('/:id', handle(200, (req) => docs.deleteInward(id(req))));

// ---------- Outward entries (sender) + confirmation by the receiver ("Confirm Inward Entry") ----------
export const outwardRoutes = Router();
outwardRoutes.use(protect);
outwardRoutes.get('/', authorize([...MODULES.OUTWARD, ...MODULES.CONFIRM_INWARD]), handle(200, (req) =>
  docs.listOutwards({ branchId: q(req, 'branchId'), direction: direction(req), status: q(req, 'status') })));
outwardRoutes.post('/', authorize(MODULES.OUTWARD), handle(201, (req) => docs.createOutward(outwardSchema.parse(req.body))));
outwardRoutes.put('/:id', authorize(MODULES.OUTWARD), handle(200, (req) => docs.updateOutward(id(req), outwardSchema.parse(req.body))));
outwardRoutes.delete('/:id', authorize(MODULES.OUTWARD), handle(200, (req) => docs.deleteOutward(id(req))));
outwardRoutes.post('/:id/confirm', authorize(MODULES.CONFIRM_INWARD), handle(200, (req) =>
  docs.confirmOutward(id(req), confirmOutwardSchema.parse(req.body), userName(req))));

// ---------- Returns (sender "Return Item") + confirmation by the receiver ("Return-Rejected Confirm") ----------
export const returnRoutes = Router();
returnRoutes.use(protect);
returnRoutes.get('/', authorize([...MODULES.RETURN, ...MODULES.RETURN_CONFIRM]), handle(200, (req) =>
  docs.listReturns({ branchId: q(req, 'branchId'), direction: direction(req), status: q(req, 'status'), type: q(req, 'type') })));
returnRoutes.post('/', authorize(MODULES.RETURN), handle(201, (req) => docs.createReturn(returnSchema.parse(req.body), userName(req))));
returnRoutes.post('/:id/confirm', authorize(MODULES.RETURN_CONFIRM), handle(200, (req) =>
  docs.confirmReturn(id(req), confirmReturnSchema.parse(req.body), userName(req))));

// ---------- Discards ----------
export const discardRoutes = Router();
discardRoutes.use(protect, authorize(MODULES.DISCARD));
discardRoutes.get('/', handle(200, (req) => docs.listDiscards(q(req, 'branchId'))));
discardRoutes.post('/', handle(201, (req) => docs.createDiscard(discardSchema.parse(req.body))));

// ---------- Sales ----------
export const saleRoutes = Router();
saleRoutes.use(protect, authorize(MODULES.SALE));
saleRoutes.get('/', handle(200, (req) => docs.listSales(q(req, 'branchId'))));
saleRoutes.get('/:id', handle(200, (req) => docs.getSale(id(req))));
saleRoutes.post('/', handle(201, (req) => docs.createSale(saleSchema.parse(req.body))));
