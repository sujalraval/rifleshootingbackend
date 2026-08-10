import { Router } from 'express';
import { getAll, getById, create, remove } from './issues.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, getAll)
  .post(protect, create);

router.route('/:id')
  .get(protect, getById)
  .delete(protect, remove);

export default router;
