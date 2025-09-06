-- Migration: Set up relational RBAC structure
-- This replaces the JSONB-based permissions with proper relational tables

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(action, resource)
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- Create policy_overrides table for optional JSONB policy data
CREATE TABLE IF NOT EXISTS policy_overrides (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL,
  policy JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, role_id, resource),
  CONSTRAINT policy_is_object CHECK (jsonb_typeof(policy) = 'object')
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_action_resource ON permissions(action, resource);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_policy_overrides_org_role ON policy_overrides(organization_id, role_id);
CREATE INDEX IF NOT EXISTS idx_policy_overrides_resource ON policy_overrides(resource);
CREATE INDEX IF NOT EXISTS idx_policy_overrides_policy ON policy_overrides USING GIN (policy jsonb_path_ops);

-- Insert core permissions
INSERT INTO permissions (id, action, resource, description, category) VALUES
-- Quote permissions
('perm_quotes_view', 'view', 'quotes', 'View quotes', 'quotes'),
('perm_quotes_create', 'create', 'quotes', 'Create quotes', 'quotes'),
('perm_quotes_update', 'update', 'quotes', 'Update quotes', 'quotes'),
('perm_quotes_delete', 'delete', 'quotes', 'Delete quotes', 'quotes'),
('perm_quotes_approve', 'approve', 'quotes', 'Approve quotes', 'quotes'),
('perm_quotes_send', 'send', 'quotes', 'Send quotes', 'quotes'),
('perm_quotes_override_price', 'override_price', 'quotes', 'Override quote line item prices', 'quotes'),

-- Rate card permissions
('perm_rate_cards_view', 'view', 'rate_cards', 'View rate cards', 'rate_cards'),
('perm_rate_cards_create', 'create', 'rate_cards', 'Create rate cards', 'rate_cards'),
('perm_rate_cards_update', 'update', 'rate_cards', 'Update rate cards', 'rate_cards'),
('perm_rate_cards_delete', 'delete', 'rate_cards', 'Delete rate cards', 'rate_cards'),

-- User permissions
('perm_users_view', 'view', 'users', 'View users', 'users'),
('perm_users_create', 'create', 'users', 'Create users', 'users'),
('perm_users_update', 'update', 'users', 'Update users', 'users'),
('perm_users_delete', 'delete', 'users', 'Delete users', 'users'),
('perm_users_manage_roles', 'manage_roles', 'users', 'Manage user roles', 'users'),

-- Customer permissions
('perm_customers_view', 'view', 'customers', 'View customers', 'customers'),
('perm_customers_create', 'create', 'customers', 'Create customers', 'customers'),
('perm_customers_update', 'update', 'customers', 'Update customers', 'customers'),
('perm_customers_delete', 'delete', 'customers', 'Delete customers', 'customers'),

-- Project permissions
('perm_projects_view', 'view', 'projects', 'View projects', 'projects'),
('perm_projects_create', 'create', 'projects', 'Create projects', 'projects'),
('perm_projects_update', 'update', 'projects', 'Update projects', 'projects'),
('perm_projects_delete', 'delete', 'projects', 'Delete projects', 'projects')
ON CONFLICT (action, resource) DO NOTHING;

-- Create default admin role with all permissions
INSERT INTO roles (id, organization_id, name, description, is_system, is_active) VALUES
('role_admin', 'org_default', 'Admin', 'System administrator with all permissions', true, true)
ON CONFLICT (organization_id, name) DO NOTHING;

-- Assign all permissions to admin role
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT 
  'rp_admin_' || p.id,
  'role_admin',
  p.id
FROM permissions p
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Note: After this migration, you'll need to:
-- 1. Remove the permissions JSONB column from the roles table
-- 2. Update existing role assignments to use the new structure
-- 3. Test the new permission system
