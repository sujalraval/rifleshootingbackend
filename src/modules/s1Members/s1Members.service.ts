import prisma from '../../core/prisma';
import { Prisma } from '@prisma/client';

export const findAll = async () => {
  return await prisma.s1Member.findMany({
    include: { branch: { select: { name: true, city: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

export const findById = async (id: string) => {
  const s1Member = await prisma.s1Member.findUnique({
    where: { id },
    include: { branch: true }
  });
  if (!s1Member) throw new Error('S1Member not found');
  return s1Member;
};

export const create = async (data: any) => {
  const existing = await prisma.s1Member.findUnique({ where: { s1MemberId: data.s1MemberId } });
  if (existing) throw new Error('S1Member ID already exists');
  
  return await prisma.s1Member.create({ data });
};

export const update = async (id: string, data: any) => {
  return await prisma.s1Member.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return await prisma.s1Member.delete({
    where: { id }
  });
};
