import { Router } from 'express';
import { getAll, getById, create, update, remove } from './guests.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();

// Issue Item picks its recipient from the guest list
router.use(protect, authorize({ read: [...MODULES.GUEST, ...MODULES.ISSUE_ITEM, ...MODULES.SALE, ...MODULES.ISSUE_LOCKER], write: MODULES.GUEST, delete: MODULES.GUEST }));

router.route('/')
  .get(getAll)
  .post(create);

router.route('/:id')
  .get(getById)
  .put(update)
  .delete(remove);

export default router;
