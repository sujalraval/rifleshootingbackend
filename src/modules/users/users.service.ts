import prisma from '../../core/prisma';
import bcrypt from 'bcrypt';

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

  async create(data: any) {
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

  async update(id: string, data: any) {
    const updateData = { ...data };
    
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        throw new Error('Email already in use by another user');
      }
    }

    if (data.password) {
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

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}
