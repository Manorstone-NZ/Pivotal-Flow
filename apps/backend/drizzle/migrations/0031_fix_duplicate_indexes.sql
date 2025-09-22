-- Migration: Fix Duplicate Index Creation
-- Description: Handle existing indexes gracefully during schema sync

-- Drop existing indexes if they exist to avoid conflicts
DROP INDEX IF EXISTS "tax_classes_code_unique";
DROP INDEX IF EXISTS "tax_classes_active_order";

-- Recreate the indexes
CREATE UNIQUE INDEX IF NOT EXISTS "tax_classes_code_unique" ON "tax_classes" USING btree ("code");
CREATE UNIQUE INDEX IF NOT EXISTS "tax_classes_active_order" ON "tax_classes" USING btree ("is_active","display_order");

-- Migration complete
SELECT 'Duplicate index fix migration completed successfully' AS status;
