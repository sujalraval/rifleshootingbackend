-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_memberId_fkey";

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "bonafideDocument" TEXT,
ADD COLUMN     "classYear" TEXT,
ADD COLUMN     "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "eligibilityCriteria" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "govtIdProof" TEXT,
ADD COLUMN     "govtIdProof2" TEXT,
ADD COLUMN     "govtIdType" TEXT,
ADD COLUMN     "isLicenseHolder" BOOLEAN,
ADD COLUMN     "isStudent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licenseDocument" TEXT,
ADD COLUMN     "membershipChargeId" TEXT,
ADD COLUMN     "membershipFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "schoolCollegeName" TEXT,
ADD COLUMN     "typeOfCourse" TEXT,
ALTER COLUMN "age" DROP NOT NULL,
ALTER COLUMN "coach" DROP NOT NULL,
ALTER COLUMN "batch" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MemberSubscription" ADD COLUMN     "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "membershipChargeId" TEXT,
ADD COLUMN     "nextDueDate" TIMESTAMP(3),
ADD COLUMN     "paymentInfo" TEXT,
ADD COLUMN     "paymentMethod" TEXT;

-- AlterTable
ALTER TABLE "OutstandingCharge" ADD COLUMN     "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "outstandingChargeId" TEXT,
ADD COLUMN     "paymentInfo" TEXT,
ADD COLUMN     "s1MemberId" TEXT,
ADD COLUMN     "subscriptionId" TEXT,
ALTER COLUMN "memberId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "S1Member" ADD COLUMN     "bonafideDocument" TEXT,
ADD COLUMN     "classYear" TEXT,
ADD COLUMN     "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "eligibilityCriteria" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "govtIdProof" TEXT,
ADD COLUMN     "govtIdProof2" TEXT,
ADD COLUMN     "govtIdType" TEXT,
ADD COLUMN     "isLicenseHolder" BOOLEAN,
ADD COLUMN     "isStudent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licenseDocument" TEXT,
ADD COLUMN     "membershipChargeId" TEXT,
ADD COLUMN     "membershipFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "schoolCollegeName" TEXT,
ADD COLUMN     "typeOfCourse" TEXT,
ALTER COLUMN "age" DROP NOT NULL,
ALTER COLUMN "coach" DROP NOT NULL,
ALTER COLUMN "batch" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_membershipChargeId_fkey" FOREIGN KEY ("membershipChargeId") REFERENCES "MembershipCharge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "S1Member" ADD CONSTRAINT "S1Member_membershipChargeId_fkey" FOREIGN KEY ("membershipChargeId") REFERENCES "MembershipCharge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_s1MemberId_fkey" FOREIGN KEY ("s1MemberId") REFERENCES "S1Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "MemberSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_outstandingChargeId_fkey" FOREIGN KEY ("outstandingChargeId") REFERENCES "OutstandingCharge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutstandingCharge" ADD CONSTRAINT "OutstandingCharge_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "MemberSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberSubscription" ADD CONSTRAINT "MemberSubscription_membershipChargeId_fkey" FOREIGN KEY ("membershipChargeId") REFERENCES "MembershipCharge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
