-- Migration Script 6: User Roles Table Only
BEGIN;

-- Drop constraints and indexes that reference old column names
ALTER TABLE user_roles DROP CONSTRAINT "user_roles_userId_fkey";
ALTER TABLE user_roles DROP CONSTRAINT "user_roles_roleId_fkey";
ALTER TABLE user_roles DROP CONSTRAINT "user_roles_organizationId_fkey";
ALTER TABLE user_roles DROP CONSTRAINT "user_roles_assignedBy_fkey";
DROP INDEX "idx_user_roles_org_role_active";
DROP INDEX "idx_user_roles_org_user_active";
DROP INDEX "user_roles_userId_roleId_organizationId_key";

-- Rename columns from camelCase to snake_case
ALTER TABLE user_roles RENAME COLUMN "userId" TO user_id;
ALTER TABLE user_roles RENAME COLUMN "roleId" TO role_id;
ALTER TABLE user_roles RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE user_roles RENAME COLUMN "assignedBy" TO assigned_by;
ALTER TABLE user_roles RENAME COLUMN "assignedAt" TO assigned_at;
ALTER TABLE user_roles RENAME COLUMN "expiresAt" TO expires_at;
ALTER TABLE user_roles RENAME COLUMN "isActive" TO is_active;

-- Recreate constraints and indexes with new column names
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_id_fkey 
    FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_assigned_by_fkey 
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

CREATE INDEX idx_user_roles_org_role_active ON user_roles (organization_id, role_id, is_active);
CREATE INDEX idx_user_roles_org_user_active ON user_roles (organization_id, user_id, is_active);
CREATE UNIQUE INDEX user_roles_user_id_role_id_organization_id_key ON user_roles (user_id, role_id, organization_id);

COMMIT;
