#!/bin/bash

# C2 Seed and Fixtures - Fixtures Script
# Creates quotes, invoices, payments, time entries, and approvals
# Idempotent and safe to re-run

set -e

echo "🎭 Starting fixtures creation..."

# Load environment variables
source .env 2>/dev/null || true

# Database connection
DATABASE_URL="${DATABASE_URL:-postgresql://pivotal:pivotal@localhost:5433/pivotal}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if database is accessible
check_database() {
    log_info "Checking database connection..."
    if ! psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        log_error "Cannot connect to database. Please ensure PostgreSQL is running."
        exit 1
    fi
    log_success "Database connection verified"
}

# Create quotes
create_quotes() {
    log_info "Creating quotes..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create quotes (idempotent)
        INSERT INTO quotes (id, organization_id, customer_id, project_id, status, total_amount, currency, valid_from, valid_until, notes, created_by, created_at, updated_at)
        VALUES 
            ('quote_website_v1', 'org_acme', 'customer_acme', 'project_website', 'approved', 15000.00, 'USD', '2024-01-01', '2024-03-31', 'Website redesign quote', 'user_manager', NOW(), NOW()),
            ('quote_mobile_v1', 'org_acme', 'customer_techstart', 'project_mobile', 'sent', 25000.00, 'USD', '2024-02-01', '2024-04-30', 'Mobile app development quote', 'user_manager', NOW(), NOW()),
            ('quote_consulting_v1', 'org_acme', 'customer_consulting', 'project_consulting', 'draft', 12000.00, 'USD', '2024-03-01', '2024-05-31', 'Business consulting quote', 'user_consultant', NOW(), NOW()),
            ('quote_website_v2', 'org_acme', 'customer_acme', 'project_website', 'accepted', 18000.00, 'USD', '2024-04-01', '2024-06-30', 'Website redesign - additional features', 'user_manager', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            customer_id = EXCLUDED.customer_id,
            project_id = EXCLUDED.project_id,
            status = EXCLUDED.status,
            total_amount = EXCLUDED.total_amount,
            currency = EXCLUDED.currency,
            valid_from = EXCLUDED.valid_from,
            valid_until = EXCLUDED.valid_until,
            notes = EXCLUDED.notes,
            updated_at = NOW();
SQL
    
    log_success "Quotes created"
}

# Create quote line items
create_quote_line_items() {
    log_info "Creating quote line items..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create quote line items (idempotent)
        INSERT INTO quote_line_items (id, quote_id, description, quantity, unit_price, discount_percent, tax_percent, total, service_category_id, rate_card_item_id, created_at, updated_at)
        VALUES 
            -- Website quote v1 line items
            ('qli_web_design', 'quote_website_v1', 'UI/UX Design', 40, 120.00, 0, 0, 4800.00, 'cat_design', 'rate_item_design_standard', NOW(), NOW()),
            ('qli_web_dev', 'quote_website_v1', 'Frontend Development', 60, 150.00, 0, 0, 9000.00, 'cat_development', 'rate_item_dev_standard', NOW(), NOW()),
            ('qli_web_pm', 'quote_website_v1', 'Project Management', 20, 180.00, 0, 0, 3600.00, 'cat_project_management', 'rate_item_pm_standard', NOW(), NOW()),
            
            -- Mobile quote v1 line items
            ('qli_mobile_design', 'quote_mobile_v1', 'Mobile UI/UX Design', 60, 120.00, 0, 0, 7200.00, 'cat_design', 'rate_item_design_standard', NOW(), NOW()),
            ('qli_mobile_dev', 'quote_mobile_v1', 'Mobile App Development', 100, 150.00, 0, 0, 15000.00, 'cat_development', 'rate_item_dev_standard', NOW(), NOW()),
            ('qli_mobile_pm', 'quote_mobile_v1', 'Project Management', 30, 180.00, 0, 0, 5400.00, 'cat_project_management', 'rate_item_pm_standard', NOW(), NOW()),
            
            -- Consulting quote v1 line items
            ('qli_consulting_analysis', 'quote_consulting_v1', 'Business Analysis', 30, 200.00, 0, 0, 6000.00, 'cat_consulting', 'rate_item_consulting_standard', NOW(), NOW()),
            ('qli_consulting_strategy', 'quote_consulting_v1', 'Strategic Planning', 30, 200.00, 0, 0, 6000.00, 'cat_consulting', 'rate_item_consulting_standard', NOW(), NOW()),
            
            -- Website quote v2 line items
            ('qli_web_v2_design', 'quote_website_v2', 'Additional UI/UX Design', 20, 120.00, 0, 0, 2400.00, 'cat_design', 'rate_item_design_standard', NOW(), NOW()),
            ('qli_web_v2_dev', 'quote_website_v2', 'Additional Development', 80, 150.00, 0, 0, 12000.00, 'cat_development', 'rate_item_dev_standard', NOW(), NOW()),
            ('qli_web_v2_pm', 'quote_website_v2', 'Project Management', 20, 180.00, 0, 0, 3600.00, 'cat_project_management', 'rate_item_pm_standard', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            quote_id = EXCLUDED.quote_id,
            description = EXCLUDED.description,
            quantity = EXCLUDED.quantity,
            unit_price = EXCLUDED.unit_price,
            discount_percent = EXCLUDED.discount_percent,
            tax_percent = EXCLUDED.tax_percent,
            total = EXCLUDED.total,
            service_category_id = EXCLUDED.service_category_id,
            rate_card_item_id = EXCLUDED.rate_card_item_id,
            updated_at = NOW();
SQL
    
    log_success "Quote line items created"
}

# Create invoices
create_invoices() {
    log_info "Creating invoices..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create invoices (idempotent)
        INSERT INTO invoices (id, organization_id, customer_id, project_id, quote_id, status, total_amount, currency, due_date, notes, created_by, created_at, updated_at)
        VALUES 
            ('invoice_website_v1', 'org_acme', 'customer_acme', 'project_website', 'quote_website_v1', 'sent', 15000.00, 'USD', '2024-02-15', 'Website redesign invoice', 'user_manager', NOW(), NOW()),
            ('invoice_mobile_v1', 'org_acme', 'customer_techstart', 'project_mobile', 'quote_mobile_v1', 'draft', 25000.00, 'USD', '2024-03-15', 'Mobile app development invoice', 'user_manager', NOW(), NOW()),
            ('invoice_website_v2', 'org_acme', 'customer_acme', 'project_website', 'quote_website_v2', 'paid', 18000.00, 'USD', '2024-05-15', 'Website redesign - additional features', 'user_manager', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            customer_id = EXCLUDED.customer_id,
            project_id = EXCLUDED.project_id,
            quote_id = EXCLUDED.quote_id,
            status = EXCLUDED.status,
            total_amount = EXCLUDED.total_amount,
            currency = EXCLUDED.currency,
            due_date = EXCLUDED.due_date,
            notes = EXCLUDED.notes,
            updated_at = NOW();
SQL
    
    log_success "Invoices created"
}

# Create invoice line items
create_invoice_line_items() {
    log_info "Creating invoice line items..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create invoice line items (idempotent)
        INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, discount_percent, tax_percent, total, service_category_id, created_at, updated_at)
        VALUES 
            -- Website invoice v1 line items
            ('ili_web_design', 'invoice_website_v1', 'UI/UX Design', 40, 120.00, 0, 0, 4800.00, 'cat_design', NOW(), NOW()),
            ('ili_web_dev', 'invoice_website_v1', 'Frontend Development', 60, 150.00, 0, 0, 9000.00, 'cat_development', NOW(), NOW()),
            ('ili_web_pm', 'invoice_website_v1', 'Project Management', 20, 180.00, 0, 0, 3600.00, 'cat_project_management', NOW(), NOW()),
            
            -- Mobile invoice v1 line items
            ('ili_mobile_design', 'invoice_mobile_v1', 'Mobile UI/UX Design', 60, 120.00, 0, 0, 7200.00, 'cat_design', NOW(), NOW()),
            ('ili_mobile_dev', 'invoice_mobile_v1', 'Mobile App Development', 100, 150.00, 0, 0, 15000.00, 'cat_development', NOW(), NOW()),
            ('ili_mobile_pm', 'invoice_mobile_v1', 'Project Management', 30, 180.00, 0, 0, 5400.00, 'cat_project_management', NOW(), NOW()),
            
            -- Website invoice v2 line items
            ('ili_web_v2_design', 'invoice_website_v2', 'Additional UI/UX Design', 20, 120.00, 0, 0, 2400.00, 'cat_design', NOW(), NOW()),
            ('ili_web_v2_dev', 'invoice_website_v2', 'Additional Development', 80, 150.00, 0, 0, 12000.00, 'cat_development', NOW(), NOW()),
            ('ili_web_v2_pm', 'invoice_website_v2', 'Project Management', 20, 180.00, 0, 0, 3600.00, 'cat_project_management', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            invoice_id = EXCLUDED.invoice_id,
            description = EXCLUDED.description,
            quantity = EXCLUDED.quantity,
            unit_price = EXCLUDED.unit_price,
            discount_percent = EXCLUDED.discount_percent,
            tax_percent = EXCLUDED.tax_percent,
            total = EXCLUDED.total,
            service_category_id = EXCLUDED.service_category_id,
            updated_at = NOW();
SQL
    
    log_success "Invoice line items created"
}

# Create payments
create_payments() {
    log_info "Creating payments..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create payments (idempotent)
        INSERT INTO payments (id, organization_id, customer_id, invoice_id, amount, currency, payment_method, payment_date, reference, notes, created_by, created_at, updated_at)
        VALUES 
            ('payment_website_v1_partial', 'org_acme', 'customer_acme', 'invoice_website_v1', 7500.00, 'USD', 'bank_transfer', '2024-02-20', 'REF-001', 'Partial payment for website redesign', 'user_manager', NOW(), NOW()),
            ('payment_website_v2_full', 'org_acme', 'customer_acme', 'invoice_website_v2', 18000.00, 'USD', 'credit_card', '2024-05-20', 'REF-002', 'Full payment for additional features', 'user_manager', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            customer_id = EXCLUDED.customer_id,
            invoice_id = EXCLUDED.invoice_id,
            amount = EXCLUDED.amount,
            currency = EXCLUDED.currency,
            payment_method = EXCLUDED.payment_method,
            payment_date = EXCLUDED.payment_date,
            reference = EXCLUDED.reference,
            notes = EXCLUDED.notes,
            updated_at = NOW();
SQL
    
    log_success "Payments created"
}

# Create time entries
create_time_entries() {
    log_info "Creating time entries..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create time entries (idempotent)
        INSERT INTO time_entries (id, organization_id, user_id, project_id, date, duration_hours, description, status, created_at, updated_at)
        VALUES 
            -- Website project time entries
            ('time_web_design_1', 'org_acme', 'user_consultant', 'project_website', '2024-01-15', 8.0, 'UI/UX design for homepage', 'approved', NOW(), NOW()),
            ('time_web_design_2', 'org_acme', 'user_consultant', 'project_website', '2024-01-16', 6.5, 'UI/UX design for product pages', 'approved', NOW(), NOW()),
            ('time_web_dev_1', 'org_acme', 'user_consultant', 'project_website', '2024-01-17', 8.0, 'Frontend development - homepage', 'approved', NOW(), NOW()),
            ('time_web_dev_2', 'org_acme', 'user_consultant', 'project_website', '2024-01-18', 7.0, 'Frontend development - product pages', 'approved', NOW(), NOW()),
            ('time_web_pm_1', 'org_acme', 'user_manager', 'project_website', '2024-01-19', 4.0, 'Project management and client communication', 'approved', NOW(), NOW()),
            
            -- Mobile project time entries
            ('time_mobile_design_1', 'org_acme', 'user_consultant', 'project_mobile', '2024-02-15', 8.0, 'Mobile UI/UX design - iOS', 'approved', NOW(), NOW()),
            ('time_mobile_design_2', 'org_acme', 'user_consultant', 'project_mobile', '2024-02-16', 8.0, 'Mobile UI/UX design - Android', 'approved', NOW(), NOW()),
            ('time_mobile_dev_1', 'org_acme', 'user_consultant', 'project_mobile', '2024-02-17', 8.0, 'Mobile development - iOS app', 'pending', NOW(), NOW()),
            ('time_mobile_dev_2', 'org_acme', 'user_consultant', 'project_mobile', '2024-02-18', 8.0, 'Mobile development - Android app', 'pending', NOW(), NOW()),
            
            -- Consulting project time entries
            ('time_consulting_1', 'org_acme', 'user_manager', 'project_consulting', '2024-03-15', 6.0, 'Business analysis and requirements gathering', 'approved', NOW(), NOW()),
            ('time_consulting_2', 'org_acme', 'user_manager', 'project_consulting', '2024-03-16', 8.0, 'Strategic planning session', 'approved', NOW(), NOW()),
            ('time_consulting_3', 'org_acme', 'user_manager', 'project_consulting', '2024-03-17', 4.0, 'Documentation and reporting', 'pending', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            user_id = EXCLUDED.user_id,
            project_id = EXCLUDED.project_id,
            date = EXCLUDED.date,
            duration_hours = EXCLUDED.duration_hours,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            updated_at = NOW();
SQL
    
    log_success "Time entries created"
}

# Create approval requests
create_approval_requests() {
    log_info "Creating approval requests..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create approval requests (idempotent)
        INSERT INTO approval_requests (id, organization_id, entity_type, entity_id, requester_id, approver_id, status, request_date, approval_date, notes, created_at, updated_at)
        VALUES 
            -- Quote approvals
            ('approval_quote_website_v1', 'org_acme', 'quote', 'quote_website_v1', 'user_manager', 'user_admin', 'approved', '2024-01-05', '2024-01-06', 'Approved website redesign quote', NOW(), NOW()),
            ('approval_quote_mobile_v1', 'org_acme', 'quote', 'quote_mobile_v1', 'user_manager', 'user_admin', 'approved', '2024-02-05', '2024-02-06', 'Approved mobile app quote', NOW(), NOW()),
            
            -- Time entry approvals
            ('approval_time_mobile_dev_1', 'org_acme', 'time_entry', 'time_mobile_dev_1', 'user_consultant', 'user_manager', 'pending', '2024-02-17', NULL, 'Pending approval for mobile development time', NOW(), NOW()),
            ('approval_time_mobile_dev_2', 'org_acme', 'time_entry', 'time_mobile_dev_2', 'user_consultant', 'user_manager', 'pending', '2024-02-18', NULL, 'Pending approval for mobile development time', NOW(), NOW()),
            ('approval_time_consulting_3', 'org_acme', 'time_entry', 'time_consulting_3', 'user_manager', 'user_admin', 'pending', '2024-03-17', NULL, 'Pending approval for consulting time', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            entity_type = EXCLUDED.entity_type,
            entity_id = EXCLUDED.entity_id,
            requester_id = EXCLUDED.requester_id,
            approver_id = EXCLUDED.approver_id,
            status = EXCLUDED.status,
            request_date = EXCLUDED.request_date,
            approval_date = EXCLUDED.approval_date,
            notes = EXCLUDED.notes,
            updated_at = NOW();
SQL
    
    log_success "Approval requests created"
}

# Main execution
main() {
    log_info "Starting C2 Seed and Fixtures - Fixtures Script"
    
    check_database
    create_quotes
    create_quote_line_items
    create_invoices
    create_invoice_line_items
    create_payments
    create_time_entries
    create_approval_requests
    
    log_success "Fixtures script completed successfully!"
    log_info "Created entities:"
    echo "  • Quotes: quote_website_v1, quote_mobile_v1, quote_consulting_v1, quote_website_v2"
    echo "  • Invoices: invoice_website_v1, invoice_mobile_v1, invoice_website_v2"
    echo "  • Payments: payment_website_v1_partial, payment_website_v2_full"
    echo "  • Time Entries: 12 entries across 3 projects"
    echo "  • Approval Requests: 5 requests (quotes and time entries)"
    echo ""
    log_info "Typical business flows created:"
    echo "  • Quote → Invoice → Payment flow"
    echo "  • Time Entry → Approval flow"
    echo "  • Multiple projects with different statuses"
}

# Run main function
main "$@"
