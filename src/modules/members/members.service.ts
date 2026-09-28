import prisma from '../../core/prisma';
import { AdmissionInput, CreateSubscriptionInput, PaymentInput, UpdateMemberInput } from './members.schema';
import * as membership from './membership.service';
import { notFoundError } from '../../core/http';

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

  throw notFoundError('Member not found');
};

export const create = (data: AdmissionInput) => membership.admit('member', data);

// Keeps the display text in sync when the selected disciplines change
const withDiscipline = (data: UpdateMemberInput) =>
  data.membershipFor && !data.discipline ? { ...data, discipline: data.membershipFor.join(' / ') } : data;

export const update = async (id: string, input: UpdateMemberInput) => {
  const data = withDiscipline(input);
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

  throw notFoundError('Member not found');
};

export const remove = async (id: string) => {
  // Payments stay (money was received); subscriptions and charges are removed with the member
  return await prisma.$transaction(async (tx) => {
    const member = await tx.member.delete({ where: { id } });
    await tx.memberSubscription.deleteMany({ where: { memberId: id } });
    await tx.outstandingCharge.deleteMany({ where: { memberId: id } });
    return member;
  });
};

// Outstanding charges and subscriptions can belong to either a Member or an S1Member
const ownerFilter = async (id: string) => {
  const member = await prisma.member.findUnique({ where: { id }, select: { id: true } });
  if (member) return { memberId: id };
  const s1Member = await prisma.s1Member.findUnique({ where: { id }, select: { id: true } });
  if (s1Member) return { s1MemberId: id };
  throw notFoundError('Member not found');
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
  if (!member && !s1Member) throw notFoundError('Member not found');

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

export const createSubscription = (id: string, data: CreateSubscriptionInput) => membership.createSubscription(id, data);

export const payOutstanding = (id: string, chargeId: string, data: PaymentInput) =>
  membership.payOutstanding(id, chargeId, data);

export const getPayments = async (id: string) => {
  return await prisma.payment.findMany({
    where: await ownerFilter(id),
    orderBy: { date: 'desc' }
  });
};