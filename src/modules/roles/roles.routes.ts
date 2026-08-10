import { Router } from 'express';
import { RolesController } from './roles.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createRoleSchema, updateRoleSchema } from './roles.schema';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();
const controller = new RolesController();

router.use(requireAuth);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(createRoleSchema), controller.create);
router.put('/:id', validateRequest(updateRoleSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
