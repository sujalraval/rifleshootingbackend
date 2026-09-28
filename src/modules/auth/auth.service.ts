import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../core/prisma';
import { JWT_SECRET, MIN_PASSWORD_LENGTH } from '../../core/config';
import { notFoundError } from '../../core/http';

export const loginUser = async (email: string, password: string) => {
  if (typeof email !== 'string' || typeof password !== 'string') throw new Error('Invalid credentials');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

  if (user.isFirstLogin) {
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, requirePasswordChange: true };
  }

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      middleName: true,
      lastName: true,
      designation: true,
      photo: true,
      role: true,
      isFirstLogin: true,
    },
  });
  if (!user) throw notFoundError('User not found');
  return user;
};

export const updatePassword = async (userId: string, newPassword: string, currentPassword?: string) => {
  if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFoundError('User not found');

  // Outside the forced first-login reset, a stolen token alone must not be enough to take over the account
  if (!user.isFirstLogin) {
    if (typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new Error('Current password is incorrect');
    }
  }

  if (await bcrypt.compare(newPassword, user.password)) {
    throw new Error('New password must be different from the current password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, isFirstLogin: false }
  });

  return { message: 'Password updated successfully' };
};
