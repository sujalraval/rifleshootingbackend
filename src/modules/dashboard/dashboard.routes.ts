import { Router } from 'express';
import { getStats } from './dashboard.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

router.get('/stats', protect, getStats);

export default router;
