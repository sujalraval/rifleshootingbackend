import prisma from '../../core/prisma';
import { Prisma } from '@prisma/client';

export const findAll = async () => {
  return await prisma.member.findMany({
    include: { branch: { select: { name: true, city: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

export const findById = async (id: string) => {
  const member = await prisma.member.findUnique({
    where: { id },
    include: { branch: true }
  });
  if (!member) throw new Error('Member not found');
  return member;
};

export const create = async (data: any) => {
  const existing = await prisma.member.findUnique({ where: { memberId: data.memberId } });
  if (existing) throw new Error('Member ID already exists');
  
  return await prisma.member.create({ data });
};

export const update = async (id: string, data: any) => {
  return await prisma.member.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return await prisma.member.delete({
    where: { id }
  });
};
