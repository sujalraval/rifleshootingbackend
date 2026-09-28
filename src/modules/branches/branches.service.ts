import prisma from '../../core/prisma';
import { Prisma } from '@prisma/client';
import { notFoundError } from '../../core/http';

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
        select: { members: { where: { isDeleted: false } }, employees: { where: { isDeleted: false } } }
      }
    }
  });
  if (!branch) throw notFoundError('Branch not found');
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
  const current = await prisma.branch.findUnique({ where: { id } });
  if (!current) throw notFoundError('Branch not found');
  const newCode = typeof data.code === 'string' ? data.code : undefined;
  if (newCode && newCode !== current.code) {
    const clash = await prisma.branch.findFirst({ where: { code: newCode, id: { not: id } } });
    if (clash) throw new Error('Branch with this code already exists');
  }
  return await prisma.$transaction(async (tx) => {
    const branch = await tx.branch.update({ where: { id }, data });
    // Membership plans refer to their institute by branch code
    if (newCode && newCode !== current.code) {
      await tx.membershipCharge.updateMany({ where: { institute: current.code }, data: { institute: newCode } });
    }
    return branch;
  });
};

export const remove = async (id: string) => {
  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) throw notFoundError('Branch not found');
  const [members, s1Members, employees, plans] = await Promise.all([
    prisma.member.count({ where: { branchId: id } }),
    prisma.s1Member.count({ where: { branchId: id } }),
    prisma.employee.count({ where: { branchId: id } }),
    prisma.membershipCharge.count({ where: { institute: branch.code } }),
  ]);
  const inUse = [
    members && `${members} members`,
    s1Members && `${s1Members} S1 members`,
    employees && `${employees} employees`,
    plans && `${plans} membership plans`,
  ].filter(Boolean);
  if (inUse.length > 0) throw new Error(`Cannot delete: this institute still has ${inUse.join(', ')}.`);

  return await prisma.branch.delete({
    where: { id }
  });
};
