import prisma from '../../core/prisma';
import bcrypt from 'bcrypt';
import { MIN_PASSWORD_LENGTH } from '../../core/config';
import { isSuperAdminRole } from '../../core/middlewares/authorize.middleware';
import { AuthUser } from '../../core/middlewares/auth.middleware';

// Fields a client may set on a user. Everything else (isFirstLogin, isDeleted, timestamps, id) is server-controlled.
const EDITABLE_FIELDS = [
  'email', 'password', 'name', 'firstName', 'middleName', 'lastName', 'gender', 'phone', 'dob',
  'placeOfBirth', 'bloodGroup', 'maritalStatus', 'dateOfJoining', 'leaveOfDate', 'designation',
  'address', 'photo', 'role',
] as const;

const pickEditable = (data: any) => {
  const result: any = {};
  for (const key of EDITABLE_FIELDS) {
    if (data?.[key] !== undefined) result[key] = data[key];
  }
  return result;
};

const assertValidPassword = (password: unknown) => {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
};

// Only a super admin may grant a super-admin role or change/delete a super-admin account
const assertCanManage = (actor: AuthUser, targetRole?: string | null) => {
  if (isSuperAdminRole(targetRole) && !isSuperAdminRole(actor.role)) {
    throw new Error('Only a super admin can manage super admin accounts');
  }
};

export class UsersService {
  async getAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        phone: true,
        dob: true,
        placeOfBirth: true,
        bloodGroup: true,
        maritalStatus: true,
        dateOfJoining: true,
        leaveOfDate: true,
        designation: true,
        address: true,
        photo: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        phone: true,
        dob: true,
        placeOfBirth: true,
        bloodGroup: true,
        maritalStatus: true,
        dateOfJoining: true,
        leaveOfDate: true,
        designation: true,
        address: true,
        photo: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(actor: AuthUser, input: any) {
    const data = pickEditable(input);
    assertValidPassword(data.password);
    if (!data.role) throw new Error('Role is required');
    assertCanManage(actor, data.role);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Parse dates
    const dob = data.dob ? new Date(data.dob) : null;
    const dateOfJoining = data.dateOfJoining ? new Date(data.dateOfJoining) : null;
    const leaveOfDate = data.leaveOfDate ? new Date(data.leaveOfDate) : null;

    return prisma.user.create({
      data: {
        ...data,
        dob,
        dateOfJoining,
        leaveOfDate,
        password: hashedPassword,
        isFirstLogin: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        role: true,
      },
    });
  }

  async update(actor: AuthUser, id: string, input: any) {
    const data = pickEditable(input);
    const updateData = { ...data };

    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) throw new Error('User not found');
    assertCanManage(actor, target.role);
    if (data.role !== undefined) assertCanManage(actor, data.role);
    if (id === actor.id && data.role !== undefined && data.role !== target.role) {
      throw new Error('You cannot change your own role');
    }
    
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        throw new Error('Email already in use by another user');
      }
    }

    if (data.password) {
      assertValidPassword(data.password);
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.dob) updateData.dob = new Date(data.dob);
    if (data.dateOfJoining) updateData.dateOfJoining = new Date(data.dateOfJoining);
    if (data.leaveOfDate !== undefined) {
      updateData.leaveOfDate = data.leaveOfDate ? new Date(data.leaveOfDate) : null;
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        role: true,
      },
    });
  }

  async delete(actor: AuthUser, id: string) {
    if (id === actor.id) throw new Error('You cannot delete your own account');
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) throw new Error('User not found');
    assertCanManage(actor, target.role);

    return prisma.user.delete({
      where: { id },
    });
  }
}
