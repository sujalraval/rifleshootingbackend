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

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Rifle Shooting ERP Backend is running!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
