import { Router } from 'express';
import * as membersController from './members.controller';
import { getAll, getById, create, update, remove } from './members.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();

// "/:id" routes also resolve S1 members (profile, certificate, invoice), so S1 permissions apply there too
const memberOnly = authorize(MODULES.MEMBER);
const memberOrS1 = authorize([...MODULES.MEMBER, ...MODULES.S1]);

router.use(protect);

router.route('/')
  .get(memberOnly, getAll)
  .post(memberOnly, create);

router.route('/:id')
  .get(memberOrS1, getById)
  .put(memberOrS1, update)
  .delete(memberOnly, remove);

router.route('/:id/outstanding')
  .get(memberOrS1, membersController.getOutstanding);

router.route('/:id/issued-items')
  .get(memberOrS1, membersController.getIssuedItems);

router.route('/:id/subscriptions')
  .get(memberOrS1, membersController.getSubscriptions)
  .post(memberOrS1, membersController.createSubscription);

export default router;
