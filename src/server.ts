import { CORS_ORIGINS } from './core/config'; // loads .env and validates required settings first
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors(CORS_ORIGINS.length > 0 ? { origin: CORS_ORIGINS } : undefined));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files as static assets. nosniff stops browsers from guessing a
// scriptable content type for an uploaded file.
const uploadsStatic = express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
});
app.use('/uploads', uploadsStatic);
app.use('/api/uploads', uploadsStatic);

import authRoutes from './modules/auth/auth.routes';
import memberRoutes from './modules/members/members.routes';
import s1MemberRoutes from './modules/s1Members/s1Members.routes';
import leadsRoutes from './modules/leads/leads.routes';
import employeesRoutes from './modules/employees/employees.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import assetsRoutes from './modules/assets/assets.routes';
import rolesRoutes from './modules/roles/roles.routes';
import ammunitionRoutes from './modules/ammunition/ammunition.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import incidentsRoutes from './modules/incidents/incidents.routes';
import trainingRoutes from './modules/training/training.routes';
import guestsRoutes from './modules/guests/guests.routes';
import issuesRoutes from './modules/issues/issues.routes';
import branchesRoutes from './modules/branches/branches.routes';
import usersRoutes from './modules/users/users.routes';
import financialYearRoutes from './modules/financialYear/financialYear.routes';
import membershipChargesRoutes from './modules/membershipCharges/membershipCharges.routes';
import membershipNamesRoutes from './modules/membershipNames/membershipNames.routes';
import uploadRoutes from './modules/upload/upload.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { itemCategoryRoutes, itemSubCategoryRoutes, itemRoutes } from './modules/itemMasters/itemMasters.routes';
import recycleBinRoutes from './modules/recycleBin/recycleBin.routes';
import { stockRoutes, inwardRoutes, outwardRoutes, returnRoutes, discardRoutes, saleRoutes } from './modules/stock/stock.routes';
import { uomRoutes, gstRateRoutes, settingsRoutes } from './modules/lookups/lookups.routes';
import { lockerRoutes, lockerIssueRoutes } from './modules/lockers/lockers.routes';

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/s1-members', s1MemberRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/ammunition', ammunitionRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/guests', guestsRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/financial-year', financialYearRoutes);
app.use('/api/membership-charges', membershipChargesRoutes);
app.use('/api/membership-names', membershipNamesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/item-categories', itemCategoryRoutes);
app.use('/api/item-sub-categories', itemSubCategoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/recycle-bin', recycleBinRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/inwards', inwardRoutes);
app.use('/api/outwards', outwardRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/discards', discardRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/uoms', uomRoutes);
app.use('/api/gst-rates', gstRateRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/lockers', lockerRoutes);
app.use('/api/locker-issues', lockerIssueRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Rifle Shooting ERP Backend is running!' });
});

// Return JSON instead of Express's default HTML error page (e.g. rejected uploads)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err?.message?.startsWith('Only JPG')) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
