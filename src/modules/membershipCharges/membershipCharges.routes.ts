import { Router } from 'express';
import * as membershipChargeController from './membershipCharges.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', membershipChargeController.getAll);
router.post('/', membershipChargeController.create);
router.put('/:id', membershipChargeController.update);
router.delete('/:id', membershipChargeController.remove);
router.patch('/:id/toggle', membershipChargeController.toggleActive);

export default router;
