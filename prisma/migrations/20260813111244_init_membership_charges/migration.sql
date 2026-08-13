-- CreateTable
CREATE TABLE "MembershipCharge" (
    "id" TEXT NOT NULL,
    "institute" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "wefDate" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "renewalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gst" TEXT NOT NULL,
    "renewal" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipCharge_pkey" PRIMARY KEY ("id")
);
