import { Router } from 'express';
import { RolesController } from './roles.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();
const controller = new RolesController();

router.use(protect);

const canManageRoles = authorize({
  // Reading is open to any signed-in user: the frontend loads roles to work out its own permissions
  read: [],
  write: [...MODULES.ROLE_MASTER, ...MODULES.ROLES_RIGHTS],
  delete: [...MODULES.ROLE_MASTER, ...MODULES.ROLES_RIGHTS],
});

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', canManageRoles, controller.create);
router.put('/:id', canManageRoles, controller.update);
router.delete('/:id', canManageRoles, controller.delete);

export default router;
