import { Router, Request } from 'express';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';
import { handle } from '../../core/http';
import * as service from './lockers.service';

const id = (req: Request) => req.params.id as string;

// Locker Master; Issue Locker reads it to pick a locker
export const lockerRoutes = Router();
lockerRoutes.use(protect, authorize({ read: [...MODULES.LOCKER, ...MODULES.ISSUE_LOCKER], write: MODULES.LOCKER, delete: MODULES.LOCKER }));
lockerRoutes.get('/', handle(200, () => service.listLockers()));
lockerRoutes.post('/', handle(201, (req) => service.createLocker(req.body)));
lockerRoutes.put('/:id', handle(200, (req) => service.updateLocker(id(req), req.body)));
lockerRoutes.patch('/:id/toggle', handle(200, (req) => service.toggleLocker(id(req))));
lockerRoutes.delete('/:id', handle(200, (req) => service.deleteLocker(id(req))));

export const lockerIssueRoutes = Router();
lockerIssueRoutes.use(protect, authorize(MODULES.ISSUE_LOCKER));
lockerIssueRoutes.get('/', handle(200, () => service.listLockerIssues()));
lockerIssueRoutes.post('/', handle(201, (req) => service.createLockerIssue(req.body)));
lockerIssueRoutes.put('/:id', handle(200, (req) => service.updateLockerIssue(id(req), req.body)));
lockerIssueRoutes.post('/:id/return', handle(200, (req) => service.returnLockerIssue(id(req))));
