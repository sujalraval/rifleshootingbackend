import { Router } from 'express';
import * as controller from './membershipNames.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.patch('/:id/toggle', controller.toggleActive);

export default router;
