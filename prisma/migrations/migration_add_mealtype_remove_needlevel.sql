-- ============================================================
-- Migration: Add MealType, Remove NeedLevel, Add nickName
-- Date: 2025-02-21
-- Safe: backward-compatible, no data loss
-- ============================================================

-- STEP 1: Create the new MealType enum
CREATE TYPE "MealType" AS ENUM ('KITCHEN', 'HOME');

-- STEP 2: Add nickName column (nullable, no risk)
ALTER TABLE "beneficiaries"
  ADD COLUMN "nickName" TEXT;

-- STEP 3: Add mealType column with a temporary DEFAULT
-- We use KITCHEN as default so existing rows get populated automatically
ALTER TABLE "beneficiaries"
  ADD COLUMN "mealType" "MealType" NOT NULL DEFAULT 'KITCHEN';

-- STEP 4: Confirm all existing beneficiaries are KITCHEN (already done by DEFAULT above)
-- This UPDATE is explicit for clarity and auditability
UPDATE "beneficiaries"
SET "mealType" = 'KITCHEN'
WHERE "mealType" IS NULL OR "mealType" = 'KITCHEN';

-- STEP 5: Remove the needLevel index before dropping the column
-- (Prisma may have named it differently — check your actual migration history)
DROP INDEX IF EXISTS "beneficiaries_needLevel_idx";

-- STEP 6: Drop the needLevel column
-- NOTE: This removes the NeedLevel enum usage from the table.
-- Only drop after confirming no other table references needLevel.
ALTER TABLE "beneficiaries"
  DROP COLUMN IF EXISTS "needLevel";

-- STEP 7: Drop the NeedLevel enum type (only after column is removed)
DROP TYPE IF EXISTS "NeedLevel";

-- STEP 8: Add index on mealType for fast filtering
CREATE INDEX "beneficiaries_mealType_idx" ON "beneficiaries" ("mealType");

-- ============================================================
-- VERIFICATION QUERIES (run manually after migration)
-- ============================================================

-- Check all beneficiaries have mealType set:
-- SELECT COUNT(*) FROM beneficiaries WHERE "mealType" IS NULL;
-- Expected: 0

-- Check column structure:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'beneficiaries';

-- Check NeedLevel enum is gone:
-- SELECT typname FROM pg_type WHERE typname = 'NeedLevel';
-- Expected: 0 rows

-- ============================================================
-- ROLLBACK (if needed - run in reverse)
-- ============================================================
-- CREATE TYPE "NeedLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
-- ALTER TABLE "beneficiaries" ADD COLUMN "needLevel" "NeedLevel" NOT NULL DEFAULT 'MEDIUM';
-- ALTER TABLE "beneficiaries" DROP COLUMN "mealType";
-- ALTER TABLE "beneficiaries" DROP COLUMN "nickName";
-- DROP TYPE "MealType";
-- DROP INDEX IF EXISTS "beneficiaries_mealType_idx";