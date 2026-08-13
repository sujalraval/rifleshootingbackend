import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

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

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Rifle Shooting ERP Backend is running!' });
});

async function seedDefaultBranch() {
  try {
    const defaultBranchId = '00000000-0000-0000-0000-000000000000';
    const branch = await prisma.branch.findUnique({ where: { id: defaultBranchId } });
    if (!branch) {
      await prisma.branch.create({
        data: {
          id: defaultBranchId,
          code: 'MAIN',
          name: 'Main Branch',
          city: 'Ahmedabad',
          address: 'Main Range',
          phone: '0000000000',
          email: 'admin@rifleshooting.com',
          gstin: '000000000000000',
          lanes: 10,
          capacity: 100,
          armsLicense: 'N/A',
          armsLicenseExpiry: '2099-12-31',
          manager: 'System',
          workingHours: '9 AM - 5 PM',
        }
      });
      console.log('Seeded default placeholder branch for members.');
    }
  } catch (error) {
    console.error('Error seeding default branch:', error);
  }
}

seedDefaultBranch().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
