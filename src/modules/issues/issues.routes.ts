import { Router } from 'express';
import { getAll, getById, create, remove } from './issues.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();

router.use(protect, authorize(MODULES.ISSUE_ITEM));

router.route('/')
  .get(getAll)
  .post(create);

router.route('/:id')
  .get(getById)
  .delete(remove);

export default router;
