import { Router } from 'express';
import { login, register, updatePassword } from './auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/update-password', updatePassword);

export default router;
