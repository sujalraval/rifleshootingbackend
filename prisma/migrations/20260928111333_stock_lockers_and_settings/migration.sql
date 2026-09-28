-- CreateTable
CREATE TABLE "Uom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Uom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GstRate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GstRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Locker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockerUsageRate" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "wefDate" TIMESTAMP(3) NOT NULL,
    "lockerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LockerUsageRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockerIssue" (
    "id" TEXT NOT NULL,
    "issueNo" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "issuedTo" TEXT NOT NULL,
    "partyCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "memberId" TEXT,
    "s1MemberId" TEXT,
    "guestId" TEXT,
    "usagePeriod" TEXT NOT NULL,
    "usageCharge" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "noOfDays" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxableAmount" DOUBLE PRECISION NOT NULL,
    "gstRate" DOUBLE PRECISION NOT NULL,
    "gstAmount" DOUBLE PRECISION NOT NULL,
    "amountPayable" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentInfo" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "returnedAt" TIMESTAMP(3),
    "lockerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LockerIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL DEFAULT '',
    "shortName" TEXT NOT NULL DEFAULT '',
    "registeredAddress" TEXT NOT NULL DEFAULT '',
    "rangeAddress" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "pan" TEXT NOT NULL DEFAULT '',
    "gstin" TEXT NOT NULL DEFAULT '',
    "areaValidity" TEXT NOT NULL DEFAULT '',
    "goodsDeliveredAt" TEXT NOT NULL DEFAULT '',
    "signatoryName" TEXT NOT NULL DEFAULT '',
    "signatoryRole" TEXT NOT NULL DEFAULT '',
    "trainerName" TEXT NOT NULL DEFAULT '',
    "presidentName" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrganisationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockUnit" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT,
    "instituteSerialNumber" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usagePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "itemId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StockUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockPriceHistory" (
    "id" TEXT NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "usagePrice" DOUBLE PRECISION NOT NULL,
    "wefDate" TIMESTAMP(3) NOT NULL,
    "changedBy" TEXT,
    "stockUnitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StockPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentNo" TEXT NOT NULL,
    "stockUnitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InwardEntry" (
    "id" TEXT NOT NULL,
    "inwardNo" TEXT NOT NULL,
    "inwardDate" TIMESTAMP(3) NOT NULL,
    "vendorName" TEXT,
    "description" TEXT,
    "receipt" TEXT,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InwardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InwardLine" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "serialNumber" TEXT,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gstValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "itemId" TEXT NOT NULL,
    "inwardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InwardLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutwardEntry" (
    "id" TEXT NOT NULL,
    "outwardNo" TEXT NOT NULL,
    "outwardDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "receipt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "receivedDate" TIMESTAMP(3),
    "receivedReceipt" TEXT,
    "confirmationDescription" TEXT,
    "confirmedBy" TEXT,
    "fromBranchId" TEXT NOT NULL,
    "toBranchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OutwardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutwardLine" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "serialNumber" TEXT,
    "instituteSerialNumber" TEXT,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usagePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "itemId" TEXT NOT NULL,
    "outwardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OutwardLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnEntry" (
    "id" TEXT NOT NULL,
    "returnNo" TEXT NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "description" TEXT,
    "returnedBy" TEXT,
    "confirmedDate" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "rejectedReason" TEXT,
    "confirmNotes" TEXT,
    "fromBranchId" TEXT NOT NULL,
    "toBranchId" TEXT NOT NULL,
    "outwardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ReturnEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnLine" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "serialNumber" TEXT,
    "instituteSerialNumber" TEXT,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usagePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "itemId" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ReturnLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscardEntry" (
    "id" TEXT NOT NULL,
    "discardNo" TEXT NOT NULL,
    "discardDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "serialNumber" TEXT,
    "instituteSerialNumber" TEXT,
    "reason" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DiscardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleEntry" (
    "id" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "soldTo" TEXT NOT NULL,
    "partyCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "memberId" TEXT,
    "s1MemberId" TEXT,
    "guestId" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "licenceNo" TEXT,
    "uin" TEXT,
    "areaValidity" TEXT,
    "purchasePeriod" TEXT,
    "validUpto" TIMESTAMP(3),
    "quantity" INTEGER NOT NULL,
    "serialNumber" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxableAmount" DOUBLE PRECISION NOT NULL,
    "gstRate" DOUBLE PRECISION NOT NULL,
    "gstAmount" DOUBLE PRECISION NOT NULL,
    "reverseCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPayable" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentInfo" TEXT,
    "itemId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SaleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Uom_name_key" ON "Uom"("name");

-- CreateIndex
CREATE INDEX "Locker_branchId_idx" ON "Locker"("branchId");

-- CreateIndex
CREATE INDEX "LockerUsageRate_lockerId_idx" ON "LockerUsageRate"("lockerId");

-- CreateIndex
CREATE UNIQUE INDEX "LockerIssue_issueNo_key" ON "LockerIssue"("issueNo");

-- CreateIndex
CREATE INDEX "LockerIssue_lockerId_idx" ON "LockerIssue"("lockerId");

-- CreateIndex
CREATE INDEX "StockUnit_itemId_branchId_idx" ON "StockUnit"("itemId", "branchId");

-- CreateIndex
CREATE INDEX "StockPriceHistory_stockUnitId_idx" ON "StockPriceHistory"("stockUnitId");

-- CreateIndex
CREATE INDEX "StockMovement_stockUnitId_idx" ON "StockMovement"("stockUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "InwardEntry_inwardNo_key" ON "InwardEntry"("inwardNo");

-- CreateIndex
CREATE UNIQUE INDEX "OutwardEntry_outwardNo_key" ON "OutwardEntry"("outwardNo");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnEntry_returnNo_key" ON "ReturnEntry"("returnNo");

-- CreateIndex
CREATE UNIQUE INDEX "DiscardEntry_discardNo_key" ON "DiscardEntry"("discardNo");

-- CreateIndex
CREATE UNIQUE INDEX "SaleEntry_invoiceNo_key" ON "SaleEntry"("invoiceNo");

-- AddForeignKey
ALTER TABLE "Locker" ADD CONSTRAINT "Locker_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockerUsageRate" ADD CONSTRAINT "LockerUsageRate_lockerId_fkey" FOREIGN KEY ("lockerId") REFERENCES "Locker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockerIssue" ADD CONSTRAINT "LockerIssue_lockerId_fkey" FOREIGN KEY ("lockerId") REFERENCES "Locker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockUnit" ADD CONSTRAINT "StockUnit_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockUnit" ADD CONSTRAINT "StockUnit_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPriceHistory" ADD CONSTRAINT "StockPriceHistory_stockUnitId_fkey" FOREIGN KEY ("stockUnitId") REFERENCES "StockUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_stockUnitId_fkey" FOREIGN KEY ("stockUnitId") REFERENCES "StockUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardEntry" ADD CONSTRAINT "InwardEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardLine" ADD CONSTRAINT "InwardLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardLine" ADD CONSTRAINT "InwardLine_inwardId_fkey" FOREIGN KEY ("inwardId") REFERENCES "InwardEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutwardEntry" ADD CONSTRAINT "OutwardEntry_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutwardEntry" ADD CONSTRAINT "OutwardEntry_toBranchId_fkey" FOREIGN KEY ("toBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutwardLine" ADD CONSTRAINT "OutwardLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutwardLine" ADD CONSTRAINT "OutwardLine_outwardId_fkey" FOREIGN KEY ("outwardId") REFERENCES "OutwardEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnEntry" ADD CONSTRAINT "ReturnEntry_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnEntry" ADD CONSTRAINT "ReturnEntry_toBranchId_fkey" FOREIGN KEY ("toBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnEntry" ADD CONSTRAINT "ReturnEntry_outwardId_fkey" FOREIGN KEY ("outwardId") REFERENCES "OutwardEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnLine" ADD CONSTRAINT "ReturnLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnLine" ADD CONSTRAINT "ReturnLine_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "ReturnEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscardEntry" ADD CONSTRAINT "DiscardEntry_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscardEntry" ADD CONSTRAINT "DiscardEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleEntry" ADD CONSTRAINT "SaleEntry_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleEntry" ADD CONSTRAINT "SaleEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
