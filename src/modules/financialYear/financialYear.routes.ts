import { Router } from 'express';
import * as financialYearController from './financialYear.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

const router = Router();

router.use(protect, authorize(MODULES.FINANCIAL_YEAR));

router.get('/', financialYearController.getAll);
router.post('/', financialYearController.create);
router.put('/:id', financialYearController.update);
router.delete('/:id', financialYearController.remove);
router.patch('/:id/toggle', financialYearController.toggleActive);

export default router;
