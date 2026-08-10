import { Router } from 'express';
import { RolesController } from './roles.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();
const controller = new RolesController();

router.use(protect);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
