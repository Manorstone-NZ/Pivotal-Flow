-- Migration Script 7: Roles Table Only
BEGIN;

-- Drop constraints and indexes that reference old column names
ALTER TABLE roles DROP CONSTRAINT "roles_organizationId_fkey";
DROP INDEX "idx_roles_org_active";
DROP INDEX "idx_roles_org_name";
DROP INDEX "roles_organizationId_name_key";

-- Rename columns from camelCase to snake_case
ALTER TABLE roles RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE roles RENAME COLUMN "isSystem" TO is_system;
ALTER TABLE roles RENAME COLUMN "isActive" TO is_active;
ALTER TABLE roles RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE roles RENAME COLUMN "updatedAt" TO updated_at;

-- Recreate constraints and indexes with new column names
ALTER TABLE roles ADD CONSTRAINT roles_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX idx_roles_org_active ON roles (organization_id, is_active);
CREATE INDEX idx_roles_org_name ON roles (organization_id, name);
CREATE UNIQUE INDEX roles_organization_id_name_key ON roles (organization_id, name);

COMMIT;
