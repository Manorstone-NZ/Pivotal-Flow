-- Migration: F1.5 Database Hardening & Integrity
-- Description: Add missing constraints, indexes, and tenant scoping for production security

-- ===== TENANT SCOPING CONSTRAINTS =====

-- Ensure all domain tables have NOT NULL tenant_id constraints
ALTER TABLE quotes ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE quote_line_items ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE customer_contacts ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE invoices ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE invoice_line_items ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE projects ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE rate_cards ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE rate_card_items ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE time_entries ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE allocations ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN tenant_id SET NOT NULL;

-- ===== FOREIGN KEY CONSTRAINTS =====

-- Add missing foreign key constraints for data integrity
ALTER TABLE quote_line_items 
ADD CONSTRAINT fk_quote_line_items_quote_id 
FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;

ALTER TABLE quote_line_items 
ADD CONSTRAINT fk_quote_line_items_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE customer_contacts 
ADD CONSTRAINT fk_customer_contacts_customer_id 
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

ALTER TABLE customer_contacts 
ADD CONSTRAINT fk_customer_contacts_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE invoice_line_items 
ADD CONSTRAINT fk_invoice_line_items_invoice_id 
FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;

ALTER TABLE invoice_line_items 
ADD CONSTRAINT fk_invoice_line_items_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE rate_card_items 
ADD CONSTRAINT fk_rate_card_items_rate_card_id 
FOREIGN KEY (rate_card_id) REFERENCES rate_cards(id) ON DELETE CASCADE;

ALTER TABLE rate_card_items 
ADD CONSTRAINT fk_rate_card_items_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE allocations 
ADD CONSTRAINT fk_allocations_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE allocations 
ADD CONSTRAINT fk_allocations_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE allocations 
ADD CONSTRAINT fk_allocations_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE time_entries 
ADD CONSTRAINT fk_time_entries_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE time_entries 
ADD CONSTRAINT fk_time_entries_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE time_entries 
ADD CONSTRAINT fk_time_entries_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- ===== UNIQUE CONSTRAINTS =====

-- Ensure unique constraints for business rules
ALTER TABLE customers 
ADD CONSTRAINT uk_customers_tenant_email 
UNIQUE (tenant_id, email);

ALTER TABLE projects 
ADD CONSTRAINT uk_projects_tenant_name 
UNIQUE (tenant_id, name);

ALTER TABLE rate_cards 
ADD CONSTRAINT uk_rate_cards_tenant_name 
UNIQUE (tenant_id, name);

ALTER TABLE quotes 
ADD CONSTRAINT uk_quotes_tenant_quote_number 
UNIQUE (tenant_id, quote_number);

-- User memberships should be unique per tenant
ALTER TABLE user_memberships 
ADD CONSTRAINT uk_user_memberships_user_tenant 
UNIQUE (user_id, tenant_id);

-- ===== PERFORMANCE INDEXES =====

-- Critical tenant-scoped indexes for query performance
CREATE INDEX IF NOT EXISTS idx_quotes_tenant_created 
ON quotes(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quotes_tenant_status 
ON quotes(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_quotes_tenant_customer 
ON quotes(tenant_id, customer_id);

CREATE INDEX IF NOT EXISTS idx_customers_tenant_created 
ON customers(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customers_tenant_status 
ON customers(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_created 
ON invoices(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status 
ON invoices(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_projects_tenant_created 
ON projects(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_tenant_status 
ON projects(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_rate_cards_tenant_effective 
ON rate_cards(tenant_id, effective_from DESC, is_active);

CREATE INDEX IF NOT EXISTS idx_rate_card_items_tenant_code 
ON rate_card_items(tenant_id, item_code);

CREATE INDEX IF NOT EXISTS idx_time_entries_tenant_date 
ON time_entries(tenant_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_time_entries_tenant_project 
ON time_entries(tenant_id, project_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_tenant_user 
ON time_entries(tenant_id, user_id);

CREATE INDEX IF NOT EXISTS idx_allocations_tenant_project 
ON allocations(tenant_id, project_id);

CREATE INDEX IF NOT EXISTS idx_allocations_tenant_user 
ON allocations(tenant_id, user_id);

CREATE INDEX IF NOT EXISTS idx_payments_tenant_created 
ON payments(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_tenant_status 
ON payments(tenant_id, status);

-- ===== AUDIT AND SECURITY INDEXES =====

-- Audit logs performance indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created 
ON audit_logs(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_entity 
ON audit_logs(tenant_id, entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_actor 
ON audit_logs(tenant_id, actor_id);

-- User activity indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant_status 
ON users(organization_id, status, last_login_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_tenant_email 
ON users(organization_id, email);

-- ===== DATA VALIDATION CONSTRAINTS =====

-- Ensure positive monetary values
ALTER TABLE quotes 
ADD CONSTRAINT chk_quotes_positive_amounts 
CHECK (subtotal >= 0 AND tax_amount >= 0 AND total_amount >= 0);

ALTER TABLE quote_line_items 
ADD CONSTRAINT chk_quote_line_items_positive_values 
CHECK (quantity > 0 AND unit_price >= 0 AND line_total >= 0);

ALTER TABLE invoices 
ADD CONSTRAINT chk_invoices_positive_amounts 
CHECK (subtotal >= 0 AND tax_amount >= 0 AND total_amount >= 0);

ALTER TABLE invoice_line_items 
ADD CONSTRAINT chk_invoice_line_items_positive_values 
CHECK (quantity > 0 AND unit_price >= 0 AND line_total >= 0);

ALTER TABLE rate_card_items 
ADD CONSTRAINT chk_rate_card_items_positive_price 
CHECK (unit_price >= 0);

ALTER TABLE payments 
ADD CONSTRAINT chk_payments_positive_amount 
CHECK (amount > 0);

-- Ensure valid status values
ALTER TABLE quotes 
ADD CONSTRAINT chk_quotes_valid_status 
CHECK (status IN ('draft', 'pending', 'approved', 'sent', 'accepted', 'rejected', 'expired', 'cancelled'));

ALTER TABLE invoices 
ADD CONSTRAINT chk_invoices_valid_status 
CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'void'));

ALTER TABLE projects 
ADD CONSTRAINT chk_projects_valid_status 
CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled'));

ALTER TABLE customers 
ADD CONSTRAINT chk_customers_valid_status 
CHECK (status IN ('active', 'inactive', 'prospect', 'archived'));

-- Ensure valid date ranges
ALTER TABLE quotes 
ADD CONSTRAINT chk_quotes_valid_dates 
CHECK (valid_until >= valid_from);

ALTER TABLE rate_cards 
ADD CONSTRAINT chk_rate_cards_valid_dates 
CHECK (effective_until IS NULL OR effective_until >= effective_from);

-- ===== SECURITY ENHANCEMENTS =====

-- Add row-level security policies for tenant isolation
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_card_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY tenant_isolation_quotes ON quotes
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_customers ON customers
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_invoices ON invoices
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_projects ON projects
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_rate_cards ON rate_cards
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_time_entries ON time_entries
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_allocations ON allocations
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_payments ON payments
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.tenant_id', true));

-- ===== COMMENTS FOR DOCUMENTATION =====

COMMENT ON TABLE quotes IS 'F1.5: Tenant-isolated quotes with RLS and comprehensive constraints';
COMMENT ON TABLE customers IS 'F1.5: Tenant-isolated customers with unique email per tenant';
COMMENT ON TABLE invoices IS 'F1.5: Tenant-isolated invoices with monetary validation';
COMMENT ON TABLE projects IS 'F1.5: Tenant-isolated projects with unique names per tenant';
COMMENT ON TABLE rate_cards IS 'F1.5: Tenant-isolated rate cards with temporal validity';
COMMENT ON TABLE time_entries IS 'F1.5: Tenant-isolated time tracking with project associations';
COMMENT ON TABLE allocations IS 'F1.5: Tenant-isolated resource allocations';
COMMENT ON TABLE payments IS 'F1.5: Tenant-isolated payments with positive amount validation';

-- Migration complete
SELECT 'F1.5 Database hardening migration completed successfully' AS status;

