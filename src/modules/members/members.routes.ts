import { Router } from 'express';
import * as membersController from './members.controller';
import { getAll, getById, create, update, remove } from './members.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();

// "/:id" routes also resolve S1 members (profile, certificate, invoice), so S1 permissions apply there too
const memberOnly = authorize(MODULES.MEMBER);
// Issue Item picks its recipient from the member list
const memberListReaders = authorize([...MODULES.MEMBER, ...MODULES.ISSUE_ITEM, ...MODULES.SALE, ...MODULES.ISSUE_LOCKER]);
const memberOrS1 = authorize([...MODULES.MEMBER, ...MODULES.S1]);

router.use(protect);

router.route('/')
  .get(memberListReaders, getAll)
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

router.route('/:id/payments')
  .get(memberOrS1, membersController.getPayments);

router.route('/:id/outstanding/:chargeId/pay')
  .post(memberOrS1, membersController.payOutstanding);

export default router;
