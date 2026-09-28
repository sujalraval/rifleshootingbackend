import { Router, Request } from 'express';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';
import { handle } from '../../core/http';
import * as service from './lookups.service';

const id = (req: Request) => req.params.id as string;

// UOM Master; Item Master reads it for its UOM dropdown
export const uomRoutes = Router();
uomRoutes.use(protect, authorize({ read: [...MODULES.UOM, ...MODULES.ITEM_MASTER], write: MODULES.UOM, delete: MODULES.UOM }));
uomRoutes.get('/', handle(200, () => service.listUoms()));
uomRoutes.post('/', handle(201, (req) => service.createUom(req.body)));
uomRoutes.put('/:id', handle(200, (req) => service.updateUom(id(req), req.body)));
uomRoutes.patch('/:id/toggle', handle(200, (req) => service.toggleUom(id(req))));
uomRoutes.delete('/:id', handle(200, (req) => service.deleteUom(id(req))));

// GST Rate Master; inward, sale and locker screens pick rates from it
export const gstRateRoutes = Router();
gstRateRoutes.use(protect, authorize({
  read: [...MODULES.GST_RATE, ...MODULES.INWARD, ...MODULES.SALE, ...MODULES.LOCKER],
  write: MODULES.GST_RATE,
  delete: MODULES.GST_RATE,
}));
gstRateRoutes.get('/', handle(200, () => service.listGstRates()));
gstRateRoutes.post('/', handle(201, (req) => service.createGstRate(req.body)));
gstRateRoutes.put('/:id', handle(200, (req) => service.updateGstRate(id(req), req.body)));
gstRateRoutes.patch('/:id/toggle', handle(200, (req) => service.toggleGstRate(id(req))));
gstRateRoutes.delete('/:id', handle(200, (req) => service.deleteGstRate(id(req))));

// Organisation details: every signed-in user reads them (invoices, certificates); only the settings screen edits
export const settingsRoutes = Router();
settingsRoutes.use(protect);
settingsRoutes.get('/', handle(200, () => service.getSettings()));
settingsRoutes.put('/', authorize(MODULES.ORG_SETTINGS), handle(200, (req) => service.updateSettings(req.body)));
