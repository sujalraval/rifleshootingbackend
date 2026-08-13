import prisma from '../../core/prisma';

export const getAllMembershipCharges = async () => {
  return await prisma.membershipCharge.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const createMembershipCharge = async (data: any) => {
  return await prisma.membershipCharge.create({
    data: {
      ...data,
      wefDate: new Date(data.wefDate),
    },
  });
};

export const updateMembershipCharge = async (id: string, data: any) => {
  const updateData = { ...data };
  if (data.wefDate) {
    updateData.wefDate = new Date(data.wefDate);
  }

  return await prisma.membershipCharge.update({
    where: { id },
    data: updateData,
  });
};

export const toggleStatus = async (id: string) => {
  const charge = await prisma.membershipCharge.findUnique({ where: { id } });
  if (!charge) throw new Error('Membership Charge not found');

  const newStatus = charge.status === 'Active' ? 'Inactive' : 'Active';

  return await prisma.membershipCharge.update({
    where: { id },
    data: { status: newStatus },
  });
};

export const deleteMembershipCharge = async (id: string) => {
  return await prisma.membershipCharge.delete({
    where: { id },
  });
};
