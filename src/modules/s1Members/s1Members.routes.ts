import { Router } from 'express';
import { getAll, getById, create, update, remove } from './s1Members.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();

// Issue Item picks its recipient from the S1 list
router.use(protect, authorize({ read: [...MODULES.S1, ...MODULES.ISSUE_ITEM, ...MODULES.SALE, ...MODULES.ISSUE_LOCKER], write: MODULES.S1, delete: MODULES.S1 }));

router.route('/')
  .get(getAll)
  .post(create);

router.route('/:id')
  .get(getById)
  .put(update)
  .delete(remove);

export default router;
