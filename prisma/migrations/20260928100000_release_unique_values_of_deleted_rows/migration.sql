-- Data-only migration: soft-deleted rows kept their unique values (email, codes, names),
-- which blocked creating a new record with the same value. Suffix them the same way the
-- application now does on soft delete. Rows already suffixed are skipped.

UPDATE "User"
SET "email" = "email" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "email" NOT LIKE '%\_\_deleted\_%';

UPDATE "Role"
SET "name" = "name" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "name" NOT LIKE '%\_\_deleted\_%';

UPDATE "Branch"
SET "code" = "code" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "code" NOT LIKE '%\_\_deleted\_%';

UPDATE "Member"
SET "memberId" = "memberId" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "memberId" NOT LIKE '%\_\_deleted\_%';

UPDATE "S1Member"
SET "s1MemberId" = "s1MemberId" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "s1MemberId" NOT LIKE '%\_\_deleted\_%';

UPDATE "Employee"
SET "empId" = "empId" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "empId" NOT LIKE '%\_\_deleted\_%';

UPDATE "InventoryItem"
SET "code" = "code" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "code" NOT LIKE '%\_\_deleted\_%';

UPDATE "Asset"
SET "assetCode" = "assetCode" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "assetCode" NOT LIKE '%\_\_deleted\_%';

UPDATE "Payment"
SET "receiptNo" = "receiptNo" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "receiptNo" NOT LIKE '%\_\_deleted\_%';

UPDATE "Incident"
SET "incidentNo" = "incidentNo" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "incidentNo" NOT LIKE '%\_\_deleted\_%';

UPDATE "Guest"
SET "guestId" = "guestId" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "guestId" NOT LIKE '%\_\_deleted\_%';

UPDATE "IssueItemRecord"
SET "issueId" = "issueId" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "issueId" NOT LIKE '%\_\_deleted\_%';

UPDATE "MembershipName"
SET "name" = "name" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "name" NOT LIKE '%\_\_deleted\_%';

UPDATE "FinancialYear"
SET "name" = "name" || '__deleted_' || (EXTRACT(EPOCH FROM COALESCE("deletedAt", "updatedAt")) * 1000)::BIGINT
WHERE "isDeleted" = true AND "name" NOT LIKE '%\_\_deleted\_%';
