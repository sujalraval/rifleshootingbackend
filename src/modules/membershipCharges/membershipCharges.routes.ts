import { Router } from 'express';
import * as membershipChargeController from './membershipCharges.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();

router.use(protect, authorize({
  read: [...MODULES.MEMBERSHIP_CHARGES, ...MODULES.MEMBER, ...MODULES.S1, ...MODULES.PACKAGES],
  write: MODULES.MEMBERSHIP_CHARGES,
  delete: MODULES.MEMBERSHIP_CHARGES,
}));

router.get('/', membershipChargeController.getAll);
router.post('/', membershipChargeController.create);
router.put('/:id', membershipChargeController.update);
router.delete('/:id', membershipChargeController.remove);
router.patch('/:id/toggle', membershipChargeController.toggleActive);

export default router;
