import prisma from '../../core/prisma';
import { CreateSubscriptionInput } from './members.schema';

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
  if (member) return { ...member, isS1: false };

  const s1Member = await prisma.s1Member.findUnique({
    where: { id },
    include: { branch: true }
  });
  if (s1Member) return { ...s1Member, memberId: s1Member.s1MemberId, isS1: true };

  throw new Error('Member not found');
};

export const create = async (data: any) => {
  const existing = await prisma.member.findUnique({ where: { memberId: data.memberId } });
  if (existing) throw new Error('Member ID already exists');
  
  return await prisma.member.create({ data });
};

export const update = async (id: string, data: any) => {
  const member = await prisma.member.findUnique({ where: { id } });
  if (member) {
    return await prisma.member.update({
      where: { id },
      data
    });
  }

  const s1Member = await prisma.s1Member.findUnique({ where: { id } });
  if (s1Member) {
    return await prisma.s1Member.update({
      where: { id },
      data
    });
  }

  throw new Error('Member not found');
};

export const remove = async (id: string) => {
  return await prisma.member.delete({
    where: { id }
  });
};

// Outstanding charges and subscriptions can belong to either a Member or an S1Member
const ownerFilter = async (id: string) => {
  const member = await prisma.member.findUnique({ where: { id }, select: { id: true } });
  if (member) return { memberId: id };
  const s1Member = await prisma.s1Member.findUnique({ where: { id }, select: { id: true } });
  if (s1Member) return { s1MemberId: id };
  throw new Error('Member not found');
};

export const getOutstanding = async (id: string) => {
  return await prisma.outstandingCharge.findMany({
    where: await ownerFilter(id),
    orderBy: { dueDate: 'asc' }
  });
};

export const getIssuedItems = async (id: string) => {
  const member = await prisma.member.findUnique({ where: { id } });
  const s1Member = !member ? await prisma.s1Member.findUnique({ where: { id } }) : null;
  if (!member && !s1Member) throw new Error('Member not found');

  const memberCode = member ? member.memberId : (s1Member?.s1MemberId || '');
  
  return await prisma.issueItemRecord.findMany({
    where: {
      OR: [
        { memberIdOrGuestId: id },
        { memberIdOrGuestId: memberCode }
      ]
    },
    orderBy: { issueDate: 'desc' }
  });
};

export const getSubscriptions = async (id: string) => {
  return await prisma.memberSubscription.findMany({
    where: await ownerFilter(id),
    orderBy: { startDate: 'desc' }
  });
};

export const createSubscription = async (id: string, data: CreateSubscriptionInput) => {
  return await prisma.memberSubscription.create({
    data: {
      ...data,
      ...(await ownerFilter(id)),
    }
  });
};