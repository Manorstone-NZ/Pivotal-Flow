#!/bin/bash

# C2 Seed and Fixtures - Seed Script
# Creates organizations, users, roles, customers, projects, and rate cards
# Idempotent and safe to re-run

set -e

echo "🌱 Starting database seed..."

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

# Create organizations
create_organizations() {
    log_info "Creating organizations..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create organizations (idempotent)
        INSERT INTO organizations (id, name, slug, domain, industry, size, timezone, currency, taxId, address, contactInfo, settings, subscriptionPlan, subscriptionStatus, createdAt, updatedAt)
        VALUES 
            ('org_acme', 'ACME Corporation', 'acme', 'acme.com', 'Technology', 'Medium', 'UTC', 'USD', 'TAX123', '{"street": "123 Main St", "city": "San Francisco", "country": "USA"}', '{"phone": "+1-555-0123", "email": "contact@acme.com"}', '{}', 'basic', 'active', NOW(), NOW()),
            ('org_techstart', 'TechStart Inc', 'techstart', 'techstart.com', 'Technology', 'Small', 'UTC', 'USD', 'TAX456', '{"street": "456 Tech Ave", "city": "Austin", "country": "USA"}', '{"phone": "+1-555-0456", "email": "hello@techstart.com"}', '{}', 'basic', 'active', NOW(), NOW()),
            ('org_consulting', 'Consulting Partners', 'consulting', 'consulting.com', 'Consulting', 'Large', 'UTC', 'USD', 'TAX789', '{"street": "789 Business Blvd", "city": "New York", "country": "USA"}', '{"phone": "+1-555-0789", "email": "info@consulting.com"}', '{}', 'basic', 'active', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            domain = EXCLUDED.domain,
            industry = EXCLUDED.industry,
            size = EXCLUDED.size,
            currency = EXCLUDED.currency,
            updatedAt = NOW();
SQL
    
    log_success "Organizations created"
}

# Create roles
create_roles() {
    log_info "Creating roles..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create roles (idempotent)
        INSERT INTO roles (id, name, description, organization_id, created_at, updated_at)
        VALUES 
            ('role_admin', 'Administrator', 'Full system access', 'org_acme', NOW(), NOW()),
            ('role_manager', 'Manager', 'Project and team management', 'org_acme', NOW(), NOW()),
            ('role_user', 'User', 'Standard user access', 'org_acme', NOW(), NOW()),
            ('role_customer', 'Customer', 'Customer portal access', 'org_acme', NOW(), NOW()),
            ('role_admin_tech', 'Administrator', 'Full system access', 'org_techstart', NOW(), NOW()),
            ('role_manager_tech', 'Manager', 'Project and team management', 'org_techstart', NOW(), NOW()),
            ('role_user_tech', 'User', 'Standard user access', 'org_techstart', NOW(), NOW()),
            ('role_customer_tech', 'Customer', 'Customer portal access', 'org_techstart', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            organization_id = EXCLUDED.organization_id,
            updated_at = NOW();
SQL
    
    log_success "Roles created"
}

# Create permissions
create_permissions() {
    log_info "Creating permissions..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create permissions (idempotent)
        INSERT INTO permissions (id, name, description, category, resource, action, createdAt)
        VALUES 
            ('perm_users_view', 'View Users', 'View user information', 'users', 'users', 'view', NOW()),
            ('perm_users_create', 'Create Users', 'Create new users', 'users', 'users', 'create', NOW()),
            ('perm_users_edit', 'Edit Users', 'Edit user information', 'users', 'users', 'edit', NOW()),
            ('perm_quotes_view', 'View Quotes', 'View quotes', 'quotes', 'quotes', 'view', NOW()),
            ('perm_quotes_create', 'Create Quotes', 'Create new quotes', 'quotes', 'quotes', 'create', NOW()),
            ('perm_quotes_edit', 'Edit Quotes', 'Edit quotes', 'quotes', 'quotes', 'edit', NOW()),
            ('perm_quotes_approve', 'Approve Quotes', 'Approve quotes', 'quotes', 'quotes', 'approve', NOW()),
            ('perm_invoices_view', 'View Invoices', 'View invoices', 'invoices', 'invoices', 'view', NOW()),
            ('perm_invoices_create', 'Create Invoices', 'Create new invoices', 'invoices', 'invoices', 'create', NOW()),
            ('perm_invoices_edit', 'Edit Invoices', 'Edit invoices', 'invoices', 'invoices', 'edit', NOW()),
            ('perm_payments_view', 'View Payments', 'View payments', 'payments', 'payments', 'view', NOW()),
            ('perm_payments_create', 'Create Payments', 'Create new payments', 'payments', 'payments', 'create', NOW()),
            ('perm_time_view', 'View Time', 'View time entries', 'time', 'time', 'view', NOW()),
            ('perm_time_create', 'Create Time', 'Create time entries', 'time', 'time', 'create', NOW()),
            ('perm_time_approve', 'Approve Time', 'Approve time entries', 'time', 'time', 'approve', NOW()),
            ('perm_portal_access', 'Portal Access', 'Access customer portal', 'portal', 'portal', 'access', NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            resource = EXCLUDED.resource,
            action = EXCLUDED.action;
SQL
    
    log_success "Permissions created"
}

# Create role permissions
create_role_permissions() {
    log_info "Creating role permissions..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create role permissions (idempotent)
        INSERT INTO role_permissions (id, role_id, permission_id, created_at)
        VALUES 
            -- Admin role gets all permissions
            ('rp_admin_users_view', 'role_admin', 'perm_users_view', NOW()),
            ('rp_admin_users_create', 'role_admin', 'perm_users_create', NOW()),
            ('rp_admin_users_edit', 'role_admin', 'perm_users_edit', NOW()),
            ('rp_admin_quotes_view', 'role_admin', 'perm_quotes_view', NOW()),
            ('rp_admin_quotes_create', 'role_admin', 'perm_quotes_create', NOW()),
            ('rp_admin_quotes_edit', 'role_admin', 'perm_quotes_edit', NOW()),
            ('rp_admin_quotes_approve', 'role_admin', 'perm_quotes_approve', NOW()),
            ('rp_admin_invoices_view', 'role_admin', 'perm_invoices_view', NOW()),
            ('rp_admin_invoices_create', 'role_admin', 'perm_invoices_create', NOW()),
            ('rp_admin_invoices_edit', 'role_admin', 'perm_invoices_edit', NOW()),
            ('rp_admin_payments_view', 'role_admin', 'perm_payments_view', NOW()),
            ('rp_admin_payments_create', 'role_admin', 'perm_payments_create', NOW()),
            ('rp_admin_time_view', 'role_admin', 'perm_time_view', NOW()),
            ('rp_admin_time_create', 'role_admin', 'perm_time_create', NOW()),
            ('rp_admin_time_approve', 'role_admin', 'perm_time_approve', NOW()),
            ('rp_admin_portal_access', 'role_admin', 'perm_portal_access', NOW()),
            
            -- Manager role gets most permissions
            ('rp_manager_users_view', 'role_manager', 'perm_users_view', NOW()),
            ('rp_manager_quotes_view', 'role_manager', 'perm_quotes_view', NOW()),
            ('rp_manager_quotes_create', 'role_manager', 'perm_quotes_create', NOW()),
            ('rp_manager_quotes_edit', 'role_manager', 'perm_quotes_edit', NOW()),
            ('rp_manager_quotes_approve', 'role_manager', 'perm_quotes_approve', NOW()),
            ('rp_manager_invoices_view', 'role_manager', 'perm_invoices_view', NOW()),
            ('rp_manager_invoices_create', 'role_manager', 'perm_invoices_create', NOW()),
            ('rp_manager_invoices_edit', 'role_manager', 'perm_invoices_edit', NOW()),
            ('rp_manager_payments_view', 'role_manager', 'perm_payments_view', NOW()),
            ('rp_manager_time_view', 'role_manager', 'perm_time_view', NOW()),
            ('rp_manager_time_create', 'role_manager', 'perm_time_create', NOW()),
            ('rp_manager_time_approve', 'role_manager', 'perm_time_approve', NOW()),
            
            -- User role gets basic permissions
            ('rp_user_quotes_view', 'role_user', 'perm_quotes_view', NOW()),
            ('rp_user_quotes_create', 'role_user', 'perm_quotes_create', NOW()),
            ('rp_user_invoices_view', 'role_user', 'perm_invoices_view', NOW()),
            ('rp_user_time_view', 'role_user', 'perm_time_view', NOW()),
            ('rp_user_time_create', 'role_user', 'perm_time_create', NOW()),
            
            -- Customer role gets portal access only
            ('rp_customer_portal_access', 'role_customer', 'perm_portal_access', NOW())
        ON CONFLICT (role_id, permission_id) DO NOTHING;
SQL
    
    log_success "Role permissions created"
}

# Create users
create_users() {
    log_info "Creating users..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create users (idempotent)
        INSERT INTO users (id, organization_id, email, username, first_name, last_name, display_name, phone, timezone, locale, status, email_verified, password_hash, preferences, metadata, created_at, updated_at, user_type, customer_id)
        VALUES 
            ('user_admin', 'org_acme', 'admin@acme.com', 'admin', 'Admin', 'User', 'Admin User', '+1-555-0001', 'UTC', 'en-US', 'active', true, '\$argon2id\$v=19\$m=65536,t=3,p=4\$hash', '{}', '{}', NOW(), NOW(), 'internal', NULL),
            ('user_manager', 'org_acme', 'manager@acme.com', 'manager', 'Manager', 'User', 'Manager User', '+1-555-0002', 'UTC', 'en-US', 'active', true, '\$argon2id\$v=19\$m=65536,t=3,p=4\$hash', '{}', '{}', NOW(), NOW(), 'internal', NULL),
            ('user_consultant', 'org_acme', 'consultant@acme.com', 'consultant', 'Consultant', 'User', 'Consultant User', '+1-555-0003', 'UTC', 'en-US', 'active', true, '\$argon2id\$v=19\$m=65536,t=3,p=4\$hash', '{}', '{}', NOW(), NOW(), 'internal', NULL),
            ('user_customer1', 'org_acme', 'customer1@acme.com', 'customer1', 'Customer', 'One', 'Customer One', '+1-555-0004', 'UTC', 'en-US', 'active', true, '\$argon2id\$v=19\$m=65536,t=3,p=4\$hash', '{}', '{}', NOW(), NOW(), 'external_customer', 'customer_acme'),
            ('user_customer2', 'org_acme', 'customer2@acme.com', 'customer2', 'Customer', 'Two', 'Customer Two', '+1-555-0005', 'UTC', 'en-US', 'active', true, '\$argon2id\$v=19\$m=65536,t=3,p=4\$hash', '{}', '{}', NOW(), NOW(), 'external_customer', 'customer_techstart')
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            email = EXCLUDED.email,
            username = EXCLUDED.username,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            display_name = EXCLUDED.display_name,
            status = EXCLUDED.status,
            customer_id = EXCLUDED.customer_id,
            updated_at = NOW();
SQL
    
    log_success "Users created"
}

# Create user roles
create_user_roles() {
    log_info "Creating user roles..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create user roles (idempotent)
        INSERT INTO user_roles (id, user_id, role_id, organization_id, assigned_by, assigned_at, is_active)
        VALUES 
            ('ur_admin', 'user_admin', 'role_admin', 'org_acme', 'user_admin', NOW(), true),
            ('ur_manager', 'user_manager', 'role_manager', 'org_acme', 'user_admin', NOW(), true),
            ('ur_consultant', 'user_consultant', 'role_user', 'org_acme', 'user_manager', NOW(), true),
            ('ur_customer1', 'user_customer1', 'role_customer', 'org_acme', 'user_manager', NOW(), true),
            ('ur_customer2', 'user_customer2', 'role_customer', 'org_acme', 'user_manager', NOW(), true)
        ON CONFLICT (user_id, role_id, organization_id) DO UPDATE SET
            assigned_at = NOW(),
            is_active = true;
SQL
    
    log_success "User roles created"
}

# Create customers
create_customers() {
    log_info "Creating customers..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create customers (idempotent)
        INSERT INTO customers (id, organization_id, customer_number, company_name, legal_name, industry, website, description, status, customer_type, source, tags, rating, created_at, updated_at)
        VALUES 
            ('customer_acme', 'org_acme', 'CUST001', 'ACME Client Corp', 'ACME Client Corporation', 'Technology', 'https://acmeclient.com', 'Technology consulting client', 'active', 'business', 'referral', ARRAY['premium', 'tech'], 5, NOW(), NOW()),
            ('customer_techstart', 'org_acme', 'CUST002', 'TechStart Solutions', 'TechStart Solutions LLC', 'Technology', 'https://techstartsolutions.com', 'Mobile app development client', 'active', 'business', 'website', ARRAY['startup', 'mobile'], 4, NOW(), NOW()),
            ('customer_consulting', 'org_acme', 'CUST003', 'Consulting Partners Ltd', 'Consulting Partners Limited', 'Consulting', 'https://consultingpartners.com', 'Business consulting client', 'active', 'business', 'referral', ARRAY['enterprise', 'consulting'], 5, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            company_name = EXCLUDED.company_name,
            legal_name = EXCLUDED.legal_name,
            industry = EXCLUDED.industry,
            status = EXCLUDED.status,
            updated_at = NOW();
SQL
    
    log_success "Customers created"
}

# Create projects
create_projects() {
    log_info "Creating projects..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create projects (idempotent)
        INSERT INTO projects (id, organization_id, name, code, description, status, owner_id, start_date, end_date, metadata, created_at, updated_at)
        VALUES 
            ('project_website', 'org_acme', 'Website Redesign', 'WEB001', 'Complete website redesign and development', 'active', 'user_manager', '2024-01-01', '2024-06-30', '{}', NOW(), NOW()),
            ('project_mobile', 'org_acme', 'Mobile App Development', 'MOB001', 'iOS and Android mobile application', 'active', 'user_manager', '2024-02-01', '2024-08-31', '{}', NOW(), NOW()),
            ('project_consulting', 'org_acme', 'Business Consulting', 'CON001', 'Strategic business consulting services', 'active', 'user_manager', '2024-03-01', '2024-12-31', '{}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            name = EXCLUDED.name,
            code = EXCLUDED.code,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            updated_at = NOW();
SQL
    
    log_success "Projects created"
}

# Create rate cards
create_rate_cards() {
    log_info "Creating rate cards..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create rate cards (idempotent)
        INSERT INTO rate_cards (id, organization_id, name, version, description, currency, effective_from, effective_until, is_default, is_active, metadata, created_at, updated_at)
        VALUES 
            ('rate_standard', 'org_acme', 'Standard Rates', '1.0', 'Standard hourly rates for consulting services', 'USD', '2024-01-01', '2024-12-31', true, true, '{}', NOW(), NOW()),
            ('rate_premium', 'org_acme', 'Premium Rates', '1.0', 'Premium rates for specialized services', 'USD', '2024-01-01', '2024-12-31', false, true, '{}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            currency = EXCLUDED.currency,
            effective_from = EXCLUDED.effective_from,
            effective_until = EXCLUDED.effective_until,
            updated_at = NOW();
SQL
    
    log_success "Rate cards created"
}

# Create service categories
create_service_categories() {
    log_info "Creating service categories..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create service categories (idempotent)
        INSERT INTO service_categories (id, name, description, organization_id, created_at, updated_at)
        VALUES 
            ('cat_development', 'Development', 'Software development services', 'org_acme', NOW(), NOW()),
            ('cat_design', 'Design', 'UI/UX design services', 'org_acme', NOW(), NOW()),
            ('cat_consulting', 'Consulting', 'Business consulting services', 'org_acme', NOW(), NOW()),
            ('cat_project_management', 'Project Management', 'Project management services', 'org_acme', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            updated_at = NOW();
SQL
    
    log_success "Service categories created"
}

# Create rate card items
create_rate_card_items() {
    log_info "Creating rate card items..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create rate card items (idempotent)
        INSERT INTO rate_card_items (id, rate_card_id, service_category_id, item_code, unit, base_rate, currency, tax_class, effective_from, effective_until, is_active, metadata, created_at, updated_at)
        VALUES 
            ('rate_item_dev_standard', 'rate_standard', 'cat_development', 'DEV-STD', 'hour', 150.00, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{}', NOW(), NOW()),
            ('rate_item_design_standard', 'rate_standard', 'cat_design', 'DESIGN-STD', 'hour', 120.00, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{}', NOW(), NOW()),
            ('rate_item_consulting_standard', 'rate_standard', 'cat_consulting', 'CONS-STD', 'hour', 200.00, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{}', NOW(), NOW()),
            ('rate_item_pm_standard', 'rate_standard', 'cat_project_management', 'PM-STD', 'hour', 180.00, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{}', NOW(), NOW()),
            ('rate_item_dev_premium', 'rate_premium', 'cat_development', 'DEV-PREM', 'hour', 200.00, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{}', NOW(), NOW()),
            ('rate_item_design_premium', 'rate_premium', 'cat_design', 'DESIGN-PREM', 'hour', 160.00, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{}', NOW(), NOW()),
            ('rate_item_consulting_premium', 'rate_premium', 'cat_consulting', 'CONS-PREM', 'hour', 250.00, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            rate_card_id = EXCLUDED.rate_card_id,
            service_category_id = EXCLUDED.service_category_id,
            item_code = EXCLUDED.item_code,
            base_rate = EXCLUDED.base_rate,
            currency = EXCLUDED.currency,
            effective_from = EXCLUDED.effective_from,
            effective_until = EXCLUDED.effective_until,
            updated_at = NOW();
SQL
    
    log_success "Rate card items created"
}

# Main execution
main() {
    log_info "Starting C2 Seed and Fixtures - Seed Script"
    
    check_database
    create_organizations
    create_roles
    create_permissions
    create_role_permissions
    create_users
    create_user_roles
    create_customers
    create_projects
    create_rate_cards
    create_service_categories
    create_rate_card_items
    
    log_success "Seed script completed successfully!"
    log_info "Created entities:"
    echo "  • Organizations: org_acme, org_techstart, org_consulting"
    echo "  • Users: user_admin, user_manager, user_consultant, user_customer1, user_customer2"
    echo "  • Roles: role_admin, role_manager, role_user, role_customer"
    echo "  • Customers: customer_acme, customer_techstart, customer_consulting"
    echo "  • Projects: project_website, project_mobile, project_consulting"
    echo "  • Rate Cards: rate_standard, rate_premium"
    echo "  • Service Categories: cat_development, cat_design, cat_consulting, cat_project_management"
}

# Run main function
main "$@"
