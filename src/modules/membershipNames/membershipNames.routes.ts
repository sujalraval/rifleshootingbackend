import { Router } from 'express';
import * as controller from './membershipNames.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();

router.use(protect, authorize({
  read: [...MODULES.MEMBERSHIP_NAME, ...MODULES.MEMBERSHIP_CHARGES],
  write: MODULES.MEMBERSHIP_NAME,
  delete: MODULES.MEMBERSHIP_NAME,
}));

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.patch('/:id/toggle', controller.toggleActive);

export default router;
