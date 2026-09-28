import prisma from '../../core/prisma';

// "Rahul Kumar Patel" -> "RP" for the activity badges
const initials = (name: string | null | undefined) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return ((parts[0][0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

export const getDashboardStats = async (startDate?: string, endDate?: string) => {
  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
  const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : new Date();

  // 1. Total Members & S1 Members
  const [normalMembersCount, s1MembersCount] = await Promise.all([
    prisma.member.count(),
    prisma.s1Member.count(),
  ]);
  const totalMembers = normalMembersCount + s1MembersCount;

  // 2. New Admissions in Date Range
  const [newNormalMembers, newS1Members] = await Promise.all([
    prisma.member.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),
    prisma.s1Member.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),
  ]);
  const newAdmissions = newNormalMembers + newS1Members;

  // 3. Payments & Revenue
  const periodPayments = await prisma.payment.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
      status: {
        in: ['Success', 'Completed', 'Paid', 'active'],
      },
    },
    select: {
      amount: true,
      date: true,
    },
  });
  const periodRevenue = periodPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  // 4. Pending Dues
  const [normalMembersDues, s1MembersDues] = await Promise.all([
    prisma.member.aggregate({
      _sum: { dueAmount: true },
    }),
    prisma.s1Member.aggregate({
      _sum: { dueAmount: true },
    }),
  ]);
  const pendingDues = (normalMembersDues._sum.dueAmount || 0) + (s1MembersDues._sum.dueAmount || 0);

  // 5. Active Leads
  const totalLeads = await prisma.lead.count({
    where: {
      stage: {
        notIn: ['Lost', 'Rejected'],
      },
    },
  });

  // 6. Active Incidents
  const activeIncidents = await prisma.incident.count({
    where: {
      status: {
        in: ['Open', 'Investigating', 'Pending'],
      },
    },
  }).catch(() => 0);

  // 7. Stock on hand across all institutes (from Inward/Outward/Return/Sale/Discard movements)
  const stockAgg = await prisma.stockUnit.aggregate({ _sum: { quantity: true } });
  const ammunitionBalance = stockAgg._sum.quantity || 0;

  // 8. Today's Attendance (Guest visits + today's logs)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayGuests = await prisma.guest.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  }).catch(() => 0);

  // Member attendance is not recorded yet (biometric sync pending), so only real guest visits are reported
  const todayAttendance = todayGuests;

  // 9. Monthly Revenue Trend (Last 6 Months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const trendPayments = await prisma.payment.findMany({
    where: { date: { gte: trendStart } },
    select: { amount: true, date: true },
  });

  // Keyed by year and month so the same month from different years is not merged
  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  const monthlyRevenueMap = new Map<string, { month: string; revenue: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyRevenueMap.set(monthKey(d), { month: monthNames[d.getMonth()], revenue: 0 });
  }

  trendPayments.forEach((p) => {
    const entry = monthlyRevenueMap.get(monthKey(new Date(p.date)));
    if (entry) entry.revenue += Number(p.amount) || 0;
  });

  const monthlyRevenueData = Array.from(monthlyRevenueMap.values());

  // 10. Branch Comparison
  const branches = await prisma.branch.findMany({
    include: {
      _count: {
        select: {
          members: { where: { isDeleted: false } },
          s1Members: { where: { isDeleted: false } },
          payments: { where: { isDeleted: false } },
        },
      },
      payments: {
        where: { isDeleted: false },
        select: { amount: true },
      },
    },
  });

  const branchRevenueData = branches.map((b) => {
    const branchRev = b.payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    return {
      branch: b.name || b.code,
      revenue: branchRev,
      members: (b._count.members || 0) + (b._count.s1Members || 0),
    };
  });

  // 11. Package Distribution
  const [normalPackages, s1Packages] = await Promise.all([
    prisma.member.groupBy({
      by: ['package'],
      _count: { package: true },
    }),
    prisma.s1Member.groupBy({
      by: ['package'],
      _count: { package: true },
    }),
  ]);

  const packageMap: { [key: string]: number } = {};
  [...normalPackages, ...s1Packages].forEach((pkg) => {
    const name = pkg.package || 'Not set';
    packageMap[name] = (packageMap[name] || 0) + pkg._count.package;
  });

  const packageDistribution = Object.keys(packageMap).map((name) => ({
    name,
    value: packageMap[name],
  }));

  // 12. Recent Activities
  const [recentMembers, recentPayments, recentLeads] = await Promise.all([
    prisma.member.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { name: true, package: true, createdAt: true },
    }),
    prisma.payment.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { member: { select: { name: true } } },
    }),
    prisma.lead.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      select: { name: true, stage: true, createdAt: true },
    }),
  ]);

  const recentActivity = [
    ...recentMembers.map((m) => ({
      id: `m-${m.name}-${m.createdAt.getTime()}`,
      title: `New member ${m.name} joined`,
      subtitle: m.package ? `${m.package} Package` : 'New admission',
      time: m.createdAt,
      type: 'member',
      badge: initials(m.name),
    })),
    ...recentPayments.map((p) => ({
      id: `p-${p.id}`,
      title: `Payment received from ${p.memberName}`,
      subtitle: `₹${Number(p.total || 0).toLocaleString()} (receipt ${p.receiptNo})`,
      time: p.createdAt,
      type: 'payment',
      badge: initials(p.memberName),
    })),
    ...recentLeads.map((l) => ({
      id: `l-${l.name}-${l.createdAt.getTime()}`,
      title: `Lead updated: ${l.name}`,
      subtitle: `Stage: ${l.stage}`,
      time: l.createdAt,
      type: 'lead',
      badge: initials(l.name),
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return {
    totalMembers,
    periodRevenue,
    newAdmissions,
    pendingDues,
    totalLeads,
    activeIncidents,
    ammunitionBalance,
    todayAttendance,
    monthlyRevenueData,
    branchRevenueData,
    packageDistribution,
    recentActivity,
  };
};
