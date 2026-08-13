import { Router } from 'express';
import * as financialYearController from './financialYear.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', financialYearController.getAll);
router.post('/', financialYearController.create);
router.put('/:id', financialYearController.update);
router.delete('/:id', financialYearController.remove);
router.patch('/:id/toggle', financialYearController.toggleActive);

export default router;
