import prisma from '../../core/prisma';

/**
 * Resolves a membership / S1 / guest number to the person it belongs to.
 * Used by Sale Item and Issue Locker, which pick a Member or Guest by number.
 */
export const resolveParty = async (type: 'Member' | 'Guest', code: string) => {
  if (type === 'Guest') {
    const guest = await prisma.guest.findFirst({ where: { guestId: code } });
    if (!guest) throw new Error(`Guest ${code} not found`);
    return {
      name: `${guest.firstName} ${guest.lastName}`,
      address: [guest.address, guest.city, guest.state, guest.pincode].filter(Boolean).join(', ') || null,
      ids: { guestId: guest.id },
    };
  }
  const member = await prisma.member.findFirst({ where: { memberId: code } });
  if (member) return { name: member.name, address: member.address, ids: { memberId: member.id } };
  const s1 = await prisma.s1Member.findFirst({ where: { s1MemberId: code } });
  if (s1) return { name: s1.name, address: s1.address, ids: { s1MemberId: s1.id } };
  throw new Error(`Member ${code} not found`);
};
