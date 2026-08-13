-- CreateTable
CREATE TABLE "OutstandingCharge" (
    "id" TEXT NOT NULL,
    "chargeType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "memberId" TEXT,
    "s1MemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OutstandingCharge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OutstandingCharge" ADD CONSTRAINT "OutstandingCharge_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutstandingCharge" ADD CONSTRAINT "OutstandingCharge_s1MemberId_fkey" FOREIGN KEY ("s1MemberId") REFERENCES "S1Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
