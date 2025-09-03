-- Migration: Fix audit_logs table column naming to use consistent snake_case
-- Date: 2025-01-30
-- Purpose: Rename camelCase columns to snake_case for consistency

-- Rename camelCase columns to snake_case
ALTER TABLE audit_logs RENAME COLUMN "organizationId" TO organization_id;
ALTER TABLE audit_logs RENAME COLUMN "userId" TO user_id;
ALTER TABLE audit_logs RENAME COLUMN "entityType" TO entity_type;
ALTER TABLE audit_logs RENAME COLUMN "entityId" TO entity_id;
ALTER TABLE audit_logs RENAME COLUMN "oldValues" TO old_values;
ALTER TABLE audit_logs RENAME COLUMN "newValues" TO new_values;
ALTER TABLE audit_logs RENAME COLUMN "ipAddress" TO ip_address_old;
ALTER TABLE audit_logs RENAME COLUMN "userAgent" TO user_agent;
ALTER TABLE audit_logs RENAME COLUMN "sessionId" TO session_id;
ALTER TABLE audit_logs RENAME COLUMN "createdAt" TO created_at;

-- Drop the old ipAddress column since we already have ip_address
ALTER TABLE audit_logs DROP COLUMN ip_address_old;

-- Update foreign key constraints to use new column names
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_organizationId_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_userId_fkey;

ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Drop old indexes that reference the old column names
DROP INDEX IF EXISTS idx_audit_logs_org_action;
DROP INDEX IF EXISTS idx_audit_logs_org_created;
DROP INDEX IF EXISTS idx_audit_logs_org_entity;

-- Recreate indexes with new column names
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_action 
  ON audit_logs (organization_id, action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created 
  ON audit_logs (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_entity 
  ON audit_logs (organization_id, entity_type, entity_id);
