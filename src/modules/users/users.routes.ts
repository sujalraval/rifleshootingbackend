import { Router } from 'express';
import { UsersController } from './users.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();
const controller = new UsersController();

router.use(protect, authorize(MODULES.USERS));

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
