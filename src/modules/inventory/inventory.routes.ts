import { Router } from 'express';
import { getAll, getById, create, update, remove } from './inventory.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { requireSuperAdmin } from '../../core/middlewares/authorize.middleware';

const router = Router();

// No screen/permission module exists for this API yet, so it is limited to super admins
router.use(protect, requireSuperAdmin);

router.route('/')
  .get(getAll)
  .post(create);

router.route('/:id')
  .get(getById)
  .put(update)
  .delete(remove);

export default router;
