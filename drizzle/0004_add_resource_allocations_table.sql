-- Migration: Add resource allocations table
-- Date: 2025-09-03
-- Description: Add resource allocation planning table with typed columns and JSONB for notes only

CREATE TABLE IF NOT EXISTS resource_allocations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  allocation_percent DECIMAL(5,2) NOT NULL CHECK (allocation_percent >= 0.00 AND allocation_percent <= 100.00),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  is_billable BOOLEAN NOT NULL DEFAULT true,
  notes JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP(3)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_resource_allocations_organization ON resource_allocations(organization_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_project ON resource_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_user ON resource_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_date_range ON resource_allocations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_deleted_at ON resource_allocations(deleted_at);

-- Unique constraints to prevent overlapping allocations
CREATE UNIQUE INDEX IF NOT EXISTS resource_allocations_user_date_overlap 
ON resource_allocations(user_id, start_date, end_date) 
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS resource_allocations_project_user 
ON resource_allocations(project_id, user_id, start_date) 
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS resource_allocations_user_date_range 
ON resource_allocations(user_id, start_date, end_date) 
WHERE deleted_at IS NULL;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resource_allocations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resource_allocations_updated_at
  BEFORE UPDATE ON resource_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_allocations_updated_at();
