import { Router } from 'express';
import { login, register, updatePassword } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/update-password', authenticate, updatePassword);

export default router;
