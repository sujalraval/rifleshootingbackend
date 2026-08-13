import { Router } from 'express';
import * as membersController from './members.controller';
import { getAll, getById, create, update, remove } from './members.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, getAll)
  .post(protect, create);

router.route('/:id')
  .get(protect, getById)
  .put(protect, update)
  .delete(protect, remove);

router.route('/:id/outstanding')
  .get(protect, membersController.getOutstanding);

router.route('/:id/issued-items')
  .get(protect, membersController.getIssuedItems);

router.route('/:id/subscriptions')
  .get(protect, membersController.getSubscriptions)
  .post(protect, membersController.createSubscription);

export default router;
