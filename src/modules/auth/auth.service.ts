import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../core/prisma';

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  
  if (user.isFirstLogin) {
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, requirePasswordChange: true };
  }
  
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
};

export const registerUser = async (name: string, email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword }
  });

  return { userId: user.id };
};

export const updatePassword = async (userId: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, isFirstLogin: false }
  });

  return { message: 'Password updated successfully' };
};
