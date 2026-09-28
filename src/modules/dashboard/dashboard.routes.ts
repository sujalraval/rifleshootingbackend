import { Router } from 'express';
import { getStats } from './dashboard.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();

router.get('/stats', protect, authorize(MODULES.DASHBOARD), getStats);

export default router;
