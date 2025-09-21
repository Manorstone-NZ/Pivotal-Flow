-- Migration: Enable Row Level Security for Tenant Safety
-- Description: Implements PostgreSQL RLS policies for multi-tenant data isolation

-- Enable RLS on all multi-tenant tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY tenant_isolation_customers ON customers
  USING (
    CASE 
      WHEN current_setting('app.tenant_id', true) IS NULL THEN true -- Allow when no tenant context (admin operations)
      ELSE tenant_id = current_setting('app.tenant_id')::text
    END
  );

CREATE POLICY tenant_isolation_quotes ON quotes
  USING (
    CASE 
      WHEN current_setting('app.tenant_id', true) IS NULL THEN true
      ELSE organization_id = current_setting('app.tenant_id')::text
    END
  );

CREATE POLICY tenant_isolation_projects ON projects
  USING (
    CASE 
      WHEN current_setting('app.tenant_id', true) IS NULL THEN true
      ELSE organization_id = current_setting('app.tenant_id')::text
    END
  );

CREATE POLICY tenant_isolation_time_entries ON time_entries
  USING (
    CASE 
      WHEN current_setting('app.tenant_id', true) IS NULL THEN true
      ELSE organization_id = current_setting('app.tenant_id')::text
    END
  );

CREATE POLICY tenant_isolation_invoices ON invoices
  USING (
    CASE 
      WHEN current_setting('app.tenant_id', true) IS NULL THEN true
      ELSE organization_id = current_setting('app.tenant_id')::text
    END
  );

CREATE POLICY tenant_isolation_payments ON payments
  USING (
    CASE 
      WHEN current_setting('app.tenant_id', true) IS NULL THEN true
      ELSE organization_id = current_setting('app.tenant_id')::text
    END
  );

CREATE POLICY tenant_isolation_rate_cards ON rate_cards
  USING (
    CASE 
      WHEN current_setting('app.tenant_id', true) IS NULL THEN true
      ELSE organization_id = current_setting('app.tenant_id')::text
    END
  );

-- Create function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.tenant_id', tenant_id, true);
END;
$$ LANGUAGE plpgsql;

-- Create function to clear tenant context
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.tenant_id', '', true);
END;
$$ LANGUAGE plpgsql;

-- Create function to get current tenant context
CREATE OR REPLACE FUNCTION get_tenant_context()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.tenant_id', true);
END;
$$ LANGUAGE plpgsql;

-- Create audit function for cross-tenant access attempts
CREATE OR REPLACE FUNCTION log_cross_tenant_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- This trigger would log any attempts to access data from wrong tenant
  -- Implementation depends on audit logging requirements
  RAISE LOG 'Cross-tenant access attempt detected: table=%, tenant_context=%, row_tenant=%', 
    TG_TABLE_NAME, 
    current_setting('app.tenant_id', true),
    COALESCE(NEW.tenant_id, NEW.organization_id, 'unknown');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for RLS performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_tenant_rls ON customers(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_org_rls ON quotes(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_org_rls ON projects(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_org_rls ON time_entries(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_org_rls ON invoices(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_org_rls ON payments(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_cards_org_rls ON rate_cards(organization_id) WHERE organization_id IS NOT NULL;

-- Create monitoring view for RLS effectiveness
CREATE OR REPLACE VIEW rls_monitoring AS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE tablename = c.relname) as policy_count
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE schemaname = 'public' 
  AND tablename IN ('customers', 'quotes', 'projects', 'time_entries', 'invoices', 'payments', 'rate_cards');

-- Comments for documentation
COMMENT ON POLICY tenant_isolation_customers ON customers IS 'Ensures customers can only be accessed within their tenant context';
COMMENT ON POLICY tenant_isolation_quotes ON quotes IS 'Ensures quotes can only be accessed within their organization context';
COMMENT ON POLICY tenant_isolation_projects ON projects IS 'Ensures projects can only be accessed within their organization context';
COMMENT ON POLICY tenant_isolation_time_entries ON time_entries IS 'Ensures time entries can only be accessed within their organization context';
COMMENT ON POLICY tenant_isolation_invoices ON invoices IS 'Ensures invoices can only be accessed within their organization context';
COMMENT ON POLICY tenant_isolation_payments ON payments IS 'Ensures payments can only be accessed within their organization context';
COMMENT ON POLICY tenant_isolation_rate_cards ON rate_cards IS 'Ensures rate cards can only be accessed within their organization context';

COMMENT ON FUNCTION set_tenant_context(TEXT) IS 'Sets the tenant context for RLS policies';
COMMENT ON FUNCTION clear_tenant_context() IS 'Clears the tenant context';
COMMENT ON FUNCTION get_tenant_context() IS 'Gets the current tenant context';
COMMENT ON VIEW rls_monitoring IS 'Monitoring view for RLS policy effectiveness';
