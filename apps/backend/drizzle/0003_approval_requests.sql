-- Migration: Add approval requests table
-- This creates the approval requests table with typed columns for all state

-- Create approval requests table
CREATE TABLE IF NOT EXISTS approval_requests (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'quote', 'invoice', 'project'
  entity_id TEXT NOT NULL,
  requested_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMP,
  reason TEXT, -- Optional reason for approval/rejection
  notes JSONB NOT NULL DEFAULT '{}', -- Optional notes, never state
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT approval_requests_entity_unique UNIQUE(entity_type, entity_id),
  CONSTRAINT approval_requests_status_valid CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  CONSTRAINT approval_requests_entity_type_valid CHECK (entity_type IN ('quote', 'invoice', 'project'))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_requests_organization ON approval_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_approver_status ON approval_requests(approver_id, status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_org_status ON approval_requests(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_entity ON approval_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_requests_created_at ON approval_requests(created_at);

-- Add organization settings for approval policies
INSERT INTO org_settings (org_id, key, value, description, created_at, updated_at)
SELECT 
  o.id,
  'quote_send_requires_approval',
  'false'::jsonb,
  'Whether quotes require approval before being sent',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM org_settings 
  WHERE org_id = o.id AND key = 'quote_send_requires_approval'
);

INSERT INTO org_settings (org_id, key, value, description, created_at, updated_at)
SELECT 
  o.id,
  'invoice_issue_requires_approval',
  'false'::jsonb,
  'Whether invoices require approval before being issued',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM org_settings 
  WHERE org_id = o.id AND key = 'invoice_issue_requires_approval'
);

INSERT INTO org_settings (org_id, key, value, description, created_at, updated_at)
SELECT 
  o.id,
  'project_close_requires_approval',
  'false'::jsonb,
  'Whether projects require approval before being closed',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM org_settings 
  WHERE org_id = o.id AND key = 'project_close_requires_approval'
);
