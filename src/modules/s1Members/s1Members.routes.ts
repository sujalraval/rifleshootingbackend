import { Router } from 'express';
import { getAll, getById, create, update, remove } from './s1Members.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();

router.use(protect, authorize(MODULES.S1));

router.route('/')
  .get(getAll)
  .post(create);

router.route('/:id')
  .get(getById)
  .put(update)
  .delete(remove);

export default router;
