import { Router } from 'express';
import { getAll, getById, create, update, remove } from './branches.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES, STOCK_SCREENS } from '../../core/middlewares/authorize.middleware';

const router = Router();

// Branches are shown as "Institute Master" and are also read by the member and charges screens
router.use(protect, authorize({
  read: [
    ...MODULES.INSTITUTE, ...MODULES.MEMBER, ...MODULES.S1, ...MODULES.MEMBERSHIP_CHARGES, ...MODULES.GUEST, ...MODULES.ISSUE_ITEM,
    ...STOCK_SCREENS, ...MODULES.LOCKER, ...MODULES.ISSUE_LOCKER,
  ],
  write: MODULES.INSTITUTE,
  delete: MODULES.INSTITUTE,
}));

router.route('/')
  .get(getAll)
  .post(create);

router.route('/:id')
  .get(getById)
  .put(update)
  .delete(remove);

export default router;
