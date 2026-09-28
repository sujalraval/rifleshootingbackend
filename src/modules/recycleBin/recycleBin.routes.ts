import { Router, Request, Response } from 'express';
import { protect } from '../../core/middlewares/auth.middleware';
import { requireSuperAdmin } from '../../core/middlewares/authorize.middleware';
import { errorStatus } from '../../core/http';
import * as service from './recycleBin.service';

// Deleted records can only be viewed and restored by super admins
const router = Router();
router.use(protect, requireSuperAdmin);

router.get('/', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await service.listDeleted() });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/:type/:id/restore', async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await service.restore(req.params.type as string, req.params.id as string) });
  } catch (error: any) {
    res.status(errorStatus(error, 400)).json({ success: false, message: error.message });
  }
});

export default router;
