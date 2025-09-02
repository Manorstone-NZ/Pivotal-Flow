-- Migration Script 4: Users Table Only
BEGIN;

-- Drop constraints and indexes that reference old column names
ALTER TABLE users DROP CONSTRAINT "users_organizationId_fkey";
DROP INDEX "users_organizationId_email_key";
DROP INDEX "idx_users_org_created";
DROP INDEX "idx_users_org_email";
DROP INDEX "idx_users_org_status_deleted";

-- Rename columns from camelCase to snake_case
ALTER TABLE users RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE users RENAME COLUMN "firstName" TO first_name;
ALTER TABLE users RENAME COLUMN "lastName" TO last_name;
ALTER TABLE users RENAME COLUMN "displayName" TO display_name;
ALTER TABLE users RENAME COLUMN "avatarUrl" TO avatar_url;
ALTER TABLE users RENAME COLUMN "emailVerified" TO email_verified;
ALTER TABLE users RENAME COLUMN "emailVerifiedAt" TO email_verified_at;
ALTER TABLE users RENAME COLUMN "lastLoginAt" TO last_login_at;
ALTER TABLE users RENAME COLUMN "loginCount" TO login_count;
ALTER TABLE users RENAME COLUMN "failedLoginAttempts" TO failed_login_attempts;
ALTER TABLE users RENAME COLUMN "lockedUntil" TO locked_until;
ALTER TABLE users RENAME COLUMN "passwordHash" TO password_hash;
ALTER TABLE users RENAME COLUMN "mfaEnabled" TO mfa_enabled;
ALTER TABLE users RENAME COLUMN "mfaSecret" TO mfa_secret;
ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE users RENAME COLUMN "deletedAt" TO deleted_at;

-- Recreate constraints and indexes with new column names
ALTER TABLE users ADD CONSTRAINT users_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE UNIQUE INDEX users_organization_id_email_key ON users (organization_id, email);
CREATE INDEX idx_users_org_created ON users (organization_id, created_at DESC);
CREATE INDEX idx_users_org_email ON users (organization_id, email);
CREATE INDEX idx_users_org_status_deleted ON users (organization_id, status, deleted_at);

COMMIT;
