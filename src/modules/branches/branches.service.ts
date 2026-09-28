import prisma from '../../core/prisma';
import { Prisma } from '@prisma/client';

export const findAll = async () => {
  return await prisma.branch.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const findById = async (id: string) => {
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: {
      _count: {
        select: { members: true, employees: true }
      }
    }
  });
  if (!branch) throw new Error('Branch not found');
  return branch;
};

// Optional form fields are required (non-null) columns in the database, so store blanks as ''
type BranchInput = Omit<Prisma.BranchCreateInput, 'address' | 'phone' | 'email' | 'gstin' | 'armsLicense' | 'armsLicenseExpiry'> &
  Partial<Pick<Prisma.BranchCreateInput, 'address' | 'phone' | 'email' | 'gstin' | 'armsLicense' | 'armsLicenseExpiry'>>;

export const create = async (data: BranchInput) => {
  const existing = await prisma.branch.findUnique({ where: { code: data.code } });
  if (existing) throw new Error('Branch with this code already exists');
  
  return await prisma.branch.create({
    data: {
      ...data,
      address: data.address ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      gstin: data.gstin ?? '',
      armsLicense: data.armsLicense ?? '',
      armsLicenseExpiry: data.armsLicenseExpiry ?? '',
    },
  });
};

export const update = async (id: string, data: Prisma.BranchUpdateInput) => {
  return await prisma.branch.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return await prisma.branch.delete({
    where: { id }
  });
};
