import { randomBytes } from 'crypto';
import prisma, { rawPrisma } from '../../core/prisma';
import { AdmissionInput, CreateSubscriptionInput, PaymentInput } from './members.schema';
import { notFoundError } from '../../core/http';

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
export type MemberKind = 'member' | 's1';

// Member and S1Member share the same columns; these helpers pick the right table/field names.
const table = (tx: Tx, kind: MemberKind): any => (kind === 'member' ? tx.member : tx.s1Member);
const idField = (kind: MemberKind) => (kind === 'member' ? 'memberId' : 's1MemberId');
const ownerFk = (kind: MemberKind, id: string) => (kind === 'member' ? { memberId: id } : { s1MemberId: id });

const round2 = (n: number) => Math.round(n * 100) / 100;
const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const gstPercent = (gst: string | null | undefined) => parseFloat(gst || '0') || 0;
/** Plan price including GST, as shown on the forms. */
export const planPayable = (plan: { cost: number; gst: string }) =>
  Math.round(plan.cost + (plan.cost * gstPercent(plan.gst)) / 100);

// ---------- Membership number: [DOB DDMMYYYY][sequence A..Z, AA..ZZ][gender M/F/O][institute 2 chars] ----------

const sequenceLabel = (n: number) => {
  // 0 -> A, 25 -> Z, 26 -> AA, ...
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (n < 26) return letters[n];
  if (n < 26 + 26 * 26) {
    const m = n - 26;
    return letters[Math.floor(m / 26)] + letters[m % 26];
  }
  throw new Error('Membership number sequence exhausted for this DOB/gender/institute');
};

const sequenceIndex = (label: string) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (label.length === 1) return letters.indexOf(label);
  return 26 + letters.indexOf(label[0]) * 26 + letters.indexOf(label[1]);
};

export const membershipNumberParts = (dob: Date, gender: string, instituteCode: string) => {
  const dd = String(dob.getUTCDate()).padStart(2, '0');
  const mm = String(dob.getUTCMonth() + 1).padStart(2, '0');
  const genderCode = (gender.trim()[0] || 'O').toUpperCase();
  const institute = instituteCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 2).padEnd(2, 'X');
  return { prefix: `${dd}${mm}${dob.getUTCFullYear()}`, suffix: `${genderCode}${institute}` };
};

const nextMembershipNumber = async (kind: MemberKind, dob: Date, gender: string, instituteCode: string) => {
  const { prefix, suffix } = membershipNumberParts(dob, gender, instituteCode);
  // Include soft-deleted rows (their numbers carry a "__deleted_" suffix) so numbers are never reused
  const rows: { code: string }[] = await (rawPrisma as any)[kind === 'member' ? 'member' : 's1Member'].findMany({
    where: { [idField(kind)]: { startsWith: prefix } },
    select: { [idField(kind)]: true },
  }).then((list: any[]) => list.map((r) => ({ code: r[idField(kind)] as string })));

  const pattern = new RegExp(`^${prefix}([A-Z]{1,2})${suffix}(__deleted_\\d+)?$`);
  const used = rows.map((r) => pattern.exec(r.code)?.[1]).filter(Boolean).map((l) => sequenceIndex(l!));
  const next = used.length ? Math.max(...used) + 1 : 0;
  return `${prefix}${sequenceLabel(next)}${suffix}`;
};

// ---------- Balances ----------

/** Recomputes totalPaid, dueAmount and expiryDate from payments, open charges and subscriptions. */
const refreshBalances = async (tx: Tx, kind: MemberKind, id: string) => {
  const fk = ownerFk(kind, id);
  const [paid, charges, latest] = await Promise.all([
    tx.payment.aggregate({ where: fk, _sum: { total: true } }),
    tx.outstandingCharge.findMany({ where: { ...fk, status: { not: 'Paid' } }, select: { amount: true, amountPaid: true } }),
    tx.memberSubscription.findFirst({ where: fk, orderBy: { endDate: 'desc' }, select: { endDate: true } }),
  ]);
  const due = charges.reduce((sum, c) => sum + Math.max(c.amount - c.amountPaid, 0), 0);
  await table(tx, kind).update({
    where: { id },
    data: {
      totalPaid: round2(paid._sum.total || 0),
      dueAmount: round2(due),
      ...(latest ? { expiryDate: latest.endDate } : {}),
    },
  });
};

type Owner = { kind: MemberKind; id: string; name: string; branchId: string };

const receiptNumber = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `RCPT-${ymd}-${randomBytes(3).toString('hex').toUpperCase()}`;
};

const recordPayment = (
  tx: Tx,
  owner: Owner,
  args: { amount: number; gst: string; method: string; info: string | null; subscriptionId?: string; outstandingChargeId?: string }
) => {
  // Amounts collected include GST; split out the tax part for the receipt
  const g = gstPercent(args.gst);
  const tax = round2((args.amount * g) / (100 + g));
  return tx.payment.create({
    data: {
      receiptNo: receiptNumber(),
      memberName: owner.name,
      amount: round2(args.amount - tax),
      tax,
      total: round2(args.amount),
      mode: args.method,
      paymentInfo: args.info,
      status: 'Paid',
      type: 'Membership',
      date: new Date(),
      branchId: owner.branchId,
      subscriptionId: args.subscriptionId,
      outstandingChargeId: args.outstandingChargeId,
      ...ownerFk(owner.kind, owner.id),
    },
  });
};

// ---------- Subscriptions ----------

const loadPlan = async (tx: Tx, kind: MemberKind, membershipChargeId: string) => {
  const plan = await tx.membershipCharge.findUnique({ where: { id: membershipChargeId } });
  if (!plan || plan.status !== 'Active') throw new Error('Selected membership plan is not available');
  const planFor = kind === 's1' ? 'S1' : 'Member';
  if ((plan.planFor || 'Member') !== planFor) {
    throw new Error(`Selected plan is not a ${kind === 's1' ? 'S1 Category' : 'Member'} plan`);
  }
  if (plan.days <= 0) throw new Error('Selected plan has no validity days configured');
  return plan;
};

const createSubscriptionTx = async (tx: Tx, owner: Owner, input: CreateSubscriptionInput) => {
  const plan = await loadPlan(tx, owner.kind, input.membershipChargeId);
  const payable = planPayable(plan);
  if (input.amountPaid + input.discount > payable) {
    throw new Error(`Amount paid plus discount (₹${input.amountPaid + input.discount}) exceeds the payable amount (₹${payable})`);
  }
  const amountDue = round2(payable - input.amountPaid - input.discount);

  const subscription = await tx.memberSubscription.create({
    data: {
      institute: plan.institute,
      membershipCharge: plan.name,
      membershipChargeId: plan.id,
      amount: payable,
      amountPaid: input.amountPaid,
      discount: input.discount,
      amountDue,
      paymentMethod: input.paymentMethod,
      paymentInfo: input.paymentInfo,
      nextDueDate: input.nextDueDate,
      startDate: input.startDate,
      endDate: addDays(input.startDate, plan.days),
      ...ownerFk(owner.kind, owner.id),
    },
  });

  if (amountDue > 0) {
    await tx.outstandingCharge.create({
      data: {
        chargeType: `Membership - ${plan.name}`,
        amount: amountDue,
        dueDate: input.nextDueDate ?? input.startDate,
        subscriptionId: subscription.id,
        ...ownerFk(owner.kind, owner.id),
      },
    });
  }
  if (input.amountPaid > 0) {
    await recordPayment(tx, owner, {
      amount: input.amountPaid,
      gst: plan.gst,
      method: input.paymentMethod!,
      info: input.paymentInfo,
      subscriptionId: subscription.id,
    });
  }
  await refreshBalances(tx, owner.kind, owner.id);
  return subscription;
};

const loadOwner = async (tx: Tx, id: string): Promise<Owner> => {
  const member = await tx.member.findUnique({ where: { id }, select: { id: true, name: true, branchId: true } });
  if (member) return { kind: 'member', ...member };
  const s1 = await tx.s1Member.findUnique({ where: { id }, select: { id: true, name: true, branchId: true } });
  if (s1) return { kind: 's1', ...s1 };
  throw notFoundError('Member not found');
};

export const createSubscription = (memberOrS1Id: string, input: CreateSubscriptionInput) =>
  prisma.$transaction(async (tx) => createSubscriptionTx(tx, await loadOwner(tx, memberOrS1Id), input));

/** Records a payment against one outstanding charge and updates the subscription and member balances. */
export const payOutstanding = (memberOrS1Id: string, chargeId: string, input: PaymentInput) =>
  prisma.$transaction(async (tx) => {
    const owner = await loadOwner(tx, memberOrS1Id);
    const charge = await tx.outstandingCharge.findFirst({ where: { id: chargeId, ...ownerFk(owner.kind, owner.id) } });
    if (!charge) throw notFoundError('Outstanding charge not found');
    const remaining = round2(charge.amount - charge.amountPaid);
    if (charge.status === 'Paid' || remaining <= 0) throw new Error('This charge is already paid');
    if (input.amount > remaining) throw new Error(`Amount exceeds the outstanding balance (₹${remaining})`);

    const subscription = charge.subscriptionId
      ? await tx.memberSubscription.findUnique({ where: { id: charge.subscriptionId }, include: { membershipChargeRef: true } })
      : null;
    const payment = await recordPayment(tx, owner, {
      amount: input.amount,
      gst: subscription?.membershipChargeRef?.gst ?? '0',
      method: input.paymentMethod,
      info: input.paymentInfo,
      subscriptionId: subscription?.id,
      outstandingChargeId: charge.id,
    });

    const amountPaid = round2(charge.amountPaid + input.amount);
    await tx.outstandingCharge.update({
      where: { id: charge.id },
      data: { amountPaid, status: amountPaid >= charge.amount ? 'Paid' : 'Pending' },
    });
    if (subscription) {
      await tx.memberSubscription.update({
        where: { id: subscription.id },
        data: {
          amountPaid: round2(subscription.amountPaid + input.amount),
          amountDue: round2(Math.max(subscription.amountDue - input.amount, 0)),
          paymentMethod: input.paymentMethod,
          paymentInfo: input.paymentInfo ?? subscription.paymentInfo,
        },
      });
    }
    await refreshBalances(tx, owner.kind, owner.id);
    return payment;
  });

// ---------- Admission ----------

const ageFrom = (dob: Date) => {
  const now = new Date();
  let age = now.getFullYear() - dob.getUTCFullYear();
  const birthdayPassed =
    now.getMonth() > dob.getUTCMonth() || (now.getMonth() === dob.getUTCMonth() && now.getDate() >= dob.getUTCDate());
  if (!birthdayPassed) age -= 1;
  return Math.max(age, 0);
};

/**
 * Creates a Member or S1Member from the admission form: assigns the membership number,
 * branch (from the plan's institute), age, and raises the first subscription + due amount.
 */
export const admit = async (kind: MemberKind, input: AdmissionInput) => {
  const { firearms: _firearms, membershipChargeId, declarationAccepted, ...fields } = input;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const plan = await loadPlan(tx, kind, membershipChargeId);
        const branch = await tx.branch.findUnique({ where: { code: plan.institute } });
        if (!branch) throw new Error(`Institute "${plan.institute}" of the selected plan does not exist`);

        const joinDate = new Date();
        const record = await table(tx, kind).create({
          data: {
            ...fields,
            [idField(kind)]: await nextMembershipNumber(kind, fields.dob, fields.gender, branch.code),
            age: ageFrom(fields.dob),
            discipline: fields.membershipFor.join(' / '),
            status: 'Active',
            joinDate,
            expiryDate: addDays(joinDate, plan.days),
            declarationAccepted,
            membershipChargeId: plan.id,
            branchId: branch.id,
          },
        });

        await createSubscriptionTx(
          tx,
          { kind, id: record.id, name: record.name, branchId: branch.id },
          { membershipChargeId: plan.id, startDate: joinDate, amountPaid: 0, discount: 0, paymentMethod: null, paymentInfo: null, nextDueDate: null }
        );
        return table(tx, kind).findUnique({ where: { id: record.id } });
      });
    } catch (error: any) {
      // Two admissions with the same DOB/gender/institute at the same moment: take the next number
      if (error?.code === 'P2002' && attempt < 2) continue;
      throw error;
    }
  }
};
