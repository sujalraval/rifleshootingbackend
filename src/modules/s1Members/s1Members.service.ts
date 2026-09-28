import prisma from '../../core/prisma';
import { AdmissionInput, UpdateMemberInput } from '../members/members.schema';
import { admit } from '../members/membership.service';
import { notFoundError } from '../../core/http';

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
  if (!s1Member) throw notFoundError('S1Member not found');
  return s1Member;
};

export const create = (data: AdmissionInput) => admit('s1', data);

export const update = async (id: string, data: UpdateMemberInput) => {
  return await prisma.s1Member.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  // Payments stay (money was received); subscriptions and charges are removed with the member
  return await prisma.$transaction(async (tx) => {
    const member = await tx.s1Member.delete({ where: { id } });
    await tx.memberSubscription.deleteMany({ where: { s1MemberId: id } });
    await tx.outstandingCharge.deleteMany({ where: { s1MemberId: id } });
    return member;
  });
};
