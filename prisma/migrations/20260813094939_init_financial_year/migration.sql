-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isFirstLogin" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "S1Member" (
    "id" TEXT NOT NULL,
    "s1MemberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "photo" TEXT,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "package" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "discipline" TEXT NOT NULL,
    "coach" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "attendanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nraiId" TEXT,
    "safetyExpiry" TEXT,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "S1Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialYear" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "currentYear" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialYear_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "S1Member_s1MemberId_key" ON "S1Member"("s1MemberId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialYear_name_key" ON "FinancialYear"("name");

-- AddForeignKey
ALTER TABLE "S1Member" ADD CONSTRAINT "S1Member_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
