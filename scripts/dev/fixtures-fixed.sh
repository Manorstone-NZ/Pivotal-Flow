#!/bin/bash

# Fixed C2 Seed and Fixtures - Fixtures Script
# Creates quotes, invoices, payments, and time entries
# Idempotent and safe to re-run

set -e

echo "🎭 Starting fixed fixtures creation..."

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
        -- Create quotes (idempotent) - Fixed column names and required fields
        INSERT INTO quotes (id, organization_id, quote_number, customer_id, project_id, title, description, status, type, valid_from, valid_until, currency, exchange_rate, subtotal, tax_rate, tax_amount, discount_type, discount_value, discount_amount, total_amount, terms_conditions, notes, internal_notes, created_by, approved_by, approved_at, sent_at, accepted_at, expires_at, metadata, created_at, updated_at)
        VALUES 
            ('quote_website_v1', 'org_acme', 'Q-2024-001', 'customer_acme', 'project_website', 'Website Redesign Quote', 'Complete website redesign and development', 'approved', 'project', '2024-01-01', '2024-03-31', 'USD', 1.000000, 15000.00, 0.1500, 2250.00, 'percentage', 0.0000, 0.00, 17250.00, 'Payment due within 30 days', 'Website redesign quote', 'High priority client', 'user_manager', 'user_admin', NOW(), NOW(), NULL, '2024-03-31', '{}', NOW(), NOW()),
            ('quote_mobile_v1', 'org_techstart', 'Q-2024-002', 'customer_techstart', 'project_mobile', 'Mobile App Development Quote', 'Native mobile app for iOS and Android', 'sent', 'project', '2024-02-01', '2024-04-30', 'USD', 1.000000, 25000.00, 0.1500, 3750.00, 'percentage', 0.0000, 0.00, 28750.00, 'Payment due within 30 days', 'Mobile app development quote', 'Startup client', 'user_manager', NULL, NULL, NOW(), NULL, '2024-04-30', '{}', NOW(), NOW()),
            ('quote_consulting_v1', 'org_consulting', 'Q-2024-003', 'customer_consulting', 'project_consulting', 'Business Consulting Quote', 'Strategic business consulting and analysis', 'draft', 'project', '2024-03-01', '2024-05-31', 'USD', 1.000000, 30000.00, 0.1500, 4500.00, 'percentage', 0.0000, 0.00, 34500.00, 'Payment due within 30 days', 'Business consulting quote', 'Enterprise client', 'user_manager', NULL, NULL, NULL, NULL, '2024-05-31', '{}', NOW(), NOW()),
            ('quote_website_v2', 'org_acme', 'Q-2024-004', 'customer_acme', 'project_website', 'Website Maintenance Quote', 'Ongoing website maintenance and updates', 'accepted', 'project', '2024-04-01', '2024-06-30', 'USD', 1.000000, 5000.00, 0.1500, 750.00, 'percentage', 0.0000, 0.00, 5750.00, 'Payment due within 30 days', 'Website maintenance quote', 'Follow-up project', 'user_manager', 'user_admin', NOW(), NOW(), NOW(), '2024-06-30', '{}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            quote_number = EXCLUDED.quote_number,
            customer_id = EXCLUDED.customer_id,
            project_id = EXCLUDED.project_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            total_amount = EXCLUDED.total_amount,
            updated_at = NOW();
SQL
    
    log_success "Quotes created"
}

# Create quote line items
create_quote_line_items() {
    log_info "Creating quote line items..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create quote line items (idempotent) - Fixed column names
        INSERT INTO quote_line_items (id, quote_id, line_number, type, sku, description, quantity, unit_price, unit_cost, unit, tax_inclusive, tax_rate, tax_amount, discount_type, discount_value, discount_amount, subtotal, total_amount, service_category_id, rate_card_id, metadata, created_at, updated_at)
        VALUES 
            ('qli_website_1', 'quote_website_v1', 1, 'service', 'DEV-SR', 'Senior Developer - Frontend Development', 40.0000, 150.0000, 100.0000, 'hour', false, 0.1500, 900.00, 'percentage', 0.0000, 0.00, 6000.00, 6900.00, 'cat_development', 'rate_standard', '{}', NOW(), NOW()),
            ('qli_website_2', 'quote_website_v1', 2, 'service', 'DES-SR', 'Senior Designer - UI/UX Design', 30.0000, 120.0000, 80.0000, 'hour', false, 0.1500, 540.00, 'percentage', 0.0000, 0.00, 3600.00, 4140.00, 'cat_design', 'rate_standard', '{}', NOW(), NOW()),
            ('qli_website_3', 'quote_website_v1', 3, 'service', 'PM-SR', 'Senior Project Manager', 20.0000, 180.0000, 120.0000, 'hour', false, 0.1500, 540.00, 'percentage', 0.0000, 0.00, 3600.00, 4140.00, 'cat_project_management', 'rate_standard', '{}', NOW(), NOW()),
            ('qli_mobile_1', 'quote_mobile_v1', 1, 'service', 'DEV-SR', 'Senior Developer - iOS Development', 60.0000, 150.0000, 100.0000, 'hour', false, 0.1500, 1350.00, 'percentage', 0.0000, 0.00, 9000.00, 10350.00, 'cat_development', 'rate_standard', '{}', NOW(), NOW()),
            ('qli_mobile_2', 'quote_mobile_v1', 2, 'service', 'DEV-SR', 'Senior Developer - Android Development', 60.0000, 150.0000, 100.0000, 'hour', false, 0.1500, 1350.00, 'percentage', 0.0000, 0.00, 9000.00, 10350.00, 'cat_development', 'rate_standard', '{}', NOW(), NOW()),
            ('qli_mobile_3', 'quote_mobile_v1', 3, 'service', 'DES-SR', 'Senior Designer - Mobile UI/UX', 40.0000, 120.0000, 80.0000, 'hour', false, 0.1500, 720.00, 'percentage', 0.0000, 0.00, 4800.00, 5520.00, 'cat_design', 'rate_standard', '{}', NOW(), NOW()),
            ('qli_mobile_4', 'quote_mobile_v1', 4, 'service', 'PM-SR', 'Senior Project Manager', 30.0000, 180.0000, 120.0000, 'hour', false, 0.1500, 810.00, 'percentage', 0.0000, 0.00, 5400.00, 6210.00, 'cat_project_management', 'rate_standard', '{}', NOW(), NOW()),
            ('qli_consulting_1', 'quote_consulting_v1', 1, 'service', 'CON-SR', 'Senior Consultant - Strategic Analysis', 80.0000, 200.0000, 150.0000, 'hour', false, 0.1500, 2400.00, 'percentage', 0.0000, 0.00, 16000.00, 18400.00, 'cat_consulting', 'rate_premium', '{}', NOW(), NOW()),
            ('qli_consulting_2', 'quote_consulting_v1', 2, 'service', 'CON-SR', 'Senior Consultant - Implementation', 60.0000, 200.0000, 150.0000, 'hour', false, 0.1500, 1800.00, 'percentage', 0.0000, 0.00, 12000.00, 13800.00, 'cat_consulting', 'rate_premium', '{}', NOW(), NOW()),
            ('qli_consulting_3', 'quote_consulting_v1', 3, 'service', 'PM-SR', 'Senior Project Manager', 40.0000, 180.0000, 120.0000, 'hour', false, 0.1500, 1080.00, 'percentage', 0.0000, 0.00, 7200.00, 8280.00, 'cat_project_management', 'rate_standard', '{}', NOW(), NOW()),
            ('qli_website_v2_1', 'quote_website_v2', 1, 'service', 'DEV-JR', 'Junior Developer - Maintenance', 20.0000, 100.0000, 70.0000, 'hour', false, 0.1500, 300.00, 'percentage', 0.0000, 0.00, 2000.00, 2300.00, 'cat_development', 'rate_standard', '{}', NOW(), NOW()),
            ('qli_website_v2_2', 'quote_website_v2', 2, 'service', 'PM-SR', 'Senior Project Manager', 10.0000, 180.0000, 120.0000, 'hour', false, 0.1500, 270.00, 'percentage', 0.0000, 0.00, 1800.00, 2070.00, 'cat_project_management', 'rate_standard', '{}', NOW(), NOW()),
            ('qli_website_v2_3', 'quote_website_v2', 3, 'service', 'DES-SR', 'Senior Designer - Updates', 15.0000, 120.0000, 80.0000, 'hour', false, 0.1500, 270.00, 'percentage', 0.0000, 0.00, 1800.00, 2070.00, 'cat_design', 'rate_standard', '{}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            quote_id = EXCLUDED.quote_id,
            line_number = EXCLUDED.line_number,
            type = EXCLUDED.type,
            sku = EXCLUDED.sku,
            description = EXCLUDED.description,
            quantity = EXCLUDED.quantity,
            unit_price = EXCLUDED.unit_price,
            unit_cost = EXCLUDED.unit_cost,
            unit = EXCLUDED.unit,
            tax_inclusive = EXCLUDED.tax_inclusive,
            tax_rate = EXCLUDED.tax_rate,
            tax_amount = EXCLUDED.tax_amount,
            discount_type = EXCLUDED.discount_type,
            discount_value = EXCLUDED.discount_value,
            discount_amount = EXCLUDED.discount_amount,
            subtotal = EXCLUDED.subtotal,
            total_amount = EXCLUDED.total_amount,
            service_category_id = EXCLUDED.service_category_id,
            rate_card_id = EXCLUDED.rate_card_id,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();
SQL
    
    log_success "Quote line items created"
}

# Create invoices
create_invoices() {
    log_info "Creating invoices..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create invoices (idempotent) - Fixed column names
        INSERT INTO invoices (id, organization_id, invoice_number, customer_id, project_id, quote_id, currency, subtotal, tax_amount, discount_amount, total_amount, paid_amount, balance_amount, status, issued_at, due_at, paid_at, overdue_at, written_off_at, fx_rate_id, title, description, terms_conditions, notes, internal_notes, metadata, created_by, approved_by, approved_at, created_at, updated_at)
        VALUES 
            ('invoice_website_v1', 'org_acme', 'INV-2024-001', 'customer_acme', 'project_website', 'quote_website_v1', 'USD', 15000.00, 2250.00, 0.00, 17250.00, 10000.00, 7250.00, 'partial', NOW(), NOW() + INTERVAL '30 days', NOW(), NULL, NULL, NULL, 'Website Redesign Invoice', 'Invoice for website redesign project', 'Payment due within 30 days', 'Partial payment received', 'High priority client', '{}', 'user_manager', 'user_admin', NOW(), NOW(), NOW()),
            ('invoice_mobile_v1', 'org_techstart', 'INV-2024-002', 'customer_techstart', 'project_mobile', 'quote_mobile_v1', 'USD', 25000.00, 3750.00, 0.00, 28750.00, 0.00, 28750.00, 'sent', NOW(), NOW() + INTERVAL '30 days', NULL, NULL, NULL, NULL, 'Mobile App Development Invoice', 'Invoice for mobile app development', 'Payment due within 30 days', 'Awaiting payment', 'Startup client', '{}', 'user_manager', NULL, NULL, NOW(), NOW()),
            ('invoice_website_v2', 'org_acme', 'INV-2024-003', 'customer_acme', 'project_website', 'quote_website_v2', 'USD', 5000.00, 750.00, 0.00, 5750.00, 5750.00, 0.00, 'paid', NOW(), NOW() + INTERVAL '30 days', NOW(), NULL, NULL, NULL, 'Website Maintenance Invoice', 'Invoice for website maintenance', 'Payment due within 30 days', 'Payment received', 'Follow-up project', '{}', 'user_manager', 'user_admin', NOW(), NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            invoice_number = EXCLUDED.invoice_number,
            customer_id = EXCLUDED.customer_id,
            project_id = EXCLUDED.project_id,
            quote_id = EXCLUDED.quote_id,
            currency = EXCLUDED.currency,
            subtotal = EXCLUDED.subtotal,
            tax_amount = EXCLUDED.tax_amount,
            discount_amount = EXCLUDED.discount_amount,
            total_amount = EXCLUDED.total_amount,
            paid_amount = EXCLUDED.paid_amount,
            balance_amount = EXCLUDED.balance_amount,
            status = EXCLUDED.status,
            updated_at = NOW();
SQL
    
    log_success "Invoices created"
}

# Create invoice line items
create_invoice_line_items() {
    log_info "Creating invoice line items..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create invoice line items (idempotent) - Fixed column names
        INSERT INTO invoice_line_items (id, invoice_id, quantity, unit_price, subtotal, tax_amount, discount_amount, total_amount, description, unit, service_category_id, rate_card_id, metadata, created_at, updated_at)
        VALUES 
            ('ili_website_1', 'invoice_website_v1', 40.0000, 150.0000, 6000.00, 900.00, 0.00, 6900.00, 'Senior Developer - Frontend Development', 'hour', 'cat_development', 'rate_standard', '{}', NOW(), NOW()),
            ('ili_website_2', 'invoice_website_v1', 30.0000, 120.0000, 3600.00, 540.00, 0.00, 4140.00, 'Senior Designer - UI/UX Design', 'hour', 'cat_design', 'rate_standard', '{}', NOW(), NOW()),
            ('ili_website_3', 'invoice_website_v1', 20.0000, 180.0000, 3600.00, 540.00, 0.00, 4140.00, 'Senior Project Manager', 'hour', 'cat_project_management', 'rate_standard', '{}', NOW(), NOW()),
            ('ili_website_4', 'invoice_website_v1', 20.0000, 90.0000, 1800.00, 270.00, 0.00, 2070.00, 'Additional Development Work', 'hour', 'cat_development', 'rate_standard', '{}', NOW(), NOW()),
            ('ili_mobile_1', 'invoice_mobile_v1', 60.0000, 150.0000, 9000.00, 1350.00, 0.00, 10350.00, 'Senior Developer - iOS Development', 'hour', 'cat_development', 'rate_standard', '{}', NOW(), NOW()),
            ('ili_mobile_2', 'invoice_mobile_v1', 60.0000, 150.0000, 9000.00, 1350.00, 0.00, 10350.00, 'Senior Developer - Android Development', 'hour', 'cat_development', 'rate_standard', '{}', NOW(), NOW()),
            ('ili_mobile_3', 'invoice_mobile_v1', 40.0000, 120.0000, 4800.00, 720.00, 0.00, 5520.00, 'Senior Designer - Mobile UI/UX', 'hour', 'cat_design', 'rate_standard', '{}', NOW(), NOW()),
            ('ili_mobile_4', 'invoice_mobile_v1', 30.0000, 180.0000, 5400.00, 810.00, 0.00, 6210.00, 'Senior Project Manager', 'hour', 'cat_project_management', 'rate_standard', '{}', NOW(), NOW()),
            ('ili_mobile_5', 'invoice_mobile_v1', 20.0000, 100.0000, 2000.00, 300.00, 0.00, 2300.00, 'Additional Development Work', 'hour', 'cat_development', 'rate_standard', '{}', NOW(), NOW()),
            ('ili_website_v2_1', 'invoice_website_v2', 20.0000, 100.0000, 2000.00, 300.00, 0.00, 2300.00, 'Junior Developer - Maintenance', 'hour', 'cat_development', 'rate_standard', '{}', NOW(), NOW()),
            ('ili_website_v2_2', 'invoice_website_v2', 10.0000, 180.0000, 1800.00, 270.00, 0.00, 2070.00, 'Senior Project Manager', 'hour', 'cat_project_management', 'rate_standard', '{}', NOW(), NOW()),
            ('ili_website_v2_3', 'invoice_website_v2', 15.0000, 120.0000, 1800.00, 270.00, 0.00, 2070.00, 'Senior Designer - Updates', 'hour', 'cat_design', 'rate_standard', '{}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            invoice_id = EXCLUDED.invoice_id,
            quantity = EXCLUDED.quantity,
            unit_price = EXCLUDED.unit_price,
            subtotal = EXCLUDED.subtotal,
            tax_amount = EXCLUDED.tax_amount,
            discount_amount = EXCLUDED.discount_amount,
            total_amount = EXCLUDED.total_amount,
            description = EXCLUDED.description,
            unit = EXCLUDED.unit,
            service_category_id = EXCLUDED.service_category_id,
            rate_card_id = EXCLUDED.rate_card_id,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();
SQL
    
    log_success "Invoice line items created"
}

# Create payments
create_payments() {
    log_info "Creating payments..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create payments (idempotent) - Fixed column names
        INSERT INTO payments (id, organization_id, invoice_id, amount, currency, method, reference, status, paid_at, voided_at, idempotency_key, gateway_payload, created_by, voided_by, void_reason, created_at, updated_at)
        VALUES 
            ('payment_website_v1_partial', 'org_acme', 'invoice_website_v1', 10000.00, 'USD', 'bank_transfer', 'TXN001', 'completed', NOW(), NULL, 'idem_001', '{"gateway": "stripe", "transaction_id": "txn_123456"}', 'user_manager', NULL, NULL, NOW(), NOW()),
            ('payment_website_v2_full', 'org_acme', 'invoice_website_v2', 5750.00, 'USD', 'credit_card', 'TXN002', 'completed', NOW(), NULL, 'idem_002', '{"gateway": "stripe", "transaction_id": "txn_123457"}', 'user_manager', NULL, NULL, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            invoice_id = EXCLUDED.invoice_id,
            amount = EXCLUDED.amount,
            currency = EXCLUDED.currency,
            method = EXCLUDED.method,
            reference = EXCLUDED.reference,
            status = EXCLUDED.status,
            paid_at = EXCLUDED.paid_at,
            gateway_payload = EXCLUDED.gateway_payload,
            updated_at = NOW();
SQL
    
    log_success "Payments created"
}

# Create approval requests
create_approval_requests() {
    log_info "Creating approval requests..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create approval requests (idempotent) - Fixed column names
        INSERT INTO approval_requests (id, organization_id, entity_type, entity_id, requested_by, approver_id, status, requested_at, decided_at, reason, notes, created_at, updated_at)
        VALUES 
            ('ar_quote_1', 'org_acme', 'quote', 'quote_website_v1', 'user_manager', 'user_admin', 'approved', NOW(), NOW(), 'Quote approval for website redesign', '{"priority": "high", "client": "vip"}', NOW(), NOW()),
            ('ar_quote_2', 'org_techstart', 'quote', 'quote_mobile_v1', 'user_manager', 'user_admin', 'pending', NOW(), NULL, 'Quote approval for mobile app development', '{"priority": "medium", "client": "startup"}', NOW(), NOW()),
            ('ar_invoice_1', 'org_acme', 'invoice', 'invoice_website_v1', 'user_manager', 'user_admin', 'approved', NOW(), NOW(), 'Invoice approval for website redesign', '{"priority": "high", "client": "vip"}', NOW(), NOW()),
            ('ar_invoice_2', 'org_techstart', 'invoice', 'invoice_mobile_v1', 'user_manager', 'user_admin', 'pending', NOW(), NULL, 'Invoice approval for mobile app development', '{"priority": "medium", "client": "startup"}', NOW(), NOW()),
            ('ar_quote_3', 'org_acme', 'quote', 'quote_website_v2', 'user_manager', 'user_admin', 'approved', NOW(), NOW(), 'Quote approval for website maintenance', '{"priority": "low", "client": "follow-up"}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            entity_type = EXCLUDED.entity_type,
            entity_id = EXCLUDED.entity_id,
            requested_by = EXCLUDED.requested_by,
            approver_id = EXCLUDED.approver_id,
            status = EXCLUDED.status,
            requested_at = EXCLUDED.requested_at,
            decided_at = EXCLUDED.decided_at,
            reason = EXCLUDED.reason,
            notes = EXCLUDED.notes,
            updated_at = NOW();
SQL
    
    log_success "Approval requests created"
}

# Main execution
main() {
    echo "ℹ️  Starting C2 Seed and Fixtures - Fixed Fixtures Script"
    
    check_database
    
    # Create data in dependency order
    create_quotes
    create_quote_line_items
    create_invoices
    create_invoice_line_items
    create_payments
    create_approval_requests
    
    log_success "Fixed fixtures script completed successfully!"
    
    echo "ℹ️  Created entities:"
    echo "  • Quotes: quote_website_v1, quote_mobile_v1, quote_consulting_v1, quote_website_v2"
    echo "  • Quote Line Items: 13 line items across all quotes"
    echo "  • Invoices: invoice_website_v1, invoice_mobile_v1, invoice_website_v2"
    echo "  • Invoice Line Items: 12 line items across all invoices"
    echo "  • Payments: payment_website_v1_partial, payment_website_v2_full"
    echo "  • Approval Requests: 5 requests (quotes and invoices)"
    
    echo "ℹ️  Typical business flows created:"
    echo "  • Quote → Invoice → Payment flow"
    echo "  • Multiple projects with different statuses"
    echo "  • Approval workflows for quotes and invoices"
}

# Run main function
main "$@"

