-- Migration Script 5: Service Categories Table Only
BEGIN;

-- Rename columns from camelCase to snake_case
ALTER TABLE service_categories RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE service_categories RENAME COLUMN "isActive" TO is_active;
ALTER TABLE service_categories RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE service_categories RENAME COLUMN "updatedAt" TO updated_at;

COMMIT;
