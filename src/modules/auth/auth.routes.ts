import { Router } from 'express';
import { login, me, updatePassword } from './auth.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

// There is intentionally no public /register route: users are created by
// administrators through /api/users.
router.post('/login', login);
router.get('/me', protect, me);
router.post('/update-password', protect, updatePassword);

export default router;
