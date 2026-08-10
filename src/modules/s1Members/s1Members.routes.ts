import { Router } from 'express';
import { getAll, getById, create, update, remove } from './s1S1S1Members.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, getAll)
  .post(protect, create);

router.route('/:id')
  .get(protect, getById)
  .put(protect, update)
  .delete(protect, remove);

export default router;
