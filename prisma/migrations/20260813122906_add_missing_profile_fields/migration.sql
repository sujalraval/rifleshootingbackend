-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactNumber" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "qualification" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "S1Member" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactNumber" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "qualification" TEXT,
ADD COLUMN     "state" TEXT;
