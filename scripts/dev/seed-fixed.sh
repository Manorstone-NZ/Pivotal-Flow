#!/bin/bash

# Fixed C2 Seed and Fixtures - Seed Script
# Creates organizations, users, roles, customers, projects, and rate cards
# Idempotent and safe to re-run

set -e

echo "🌱 Starting fixed database seed..."

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
        -- Create organizations (idempotent) - Fixed column names
        INSERT INTO organizations (id, name, slug, domain, industry, size, timezone, currency, "taxId", street, city, country, phone, email, website, contact_extras, settings, "subscriptionPlan", "subscriptionStatus", "createdAt", "updatedAt")
        VALUES 
            ('org_acme', 'ACME Corporation', 'acme', 'acme.com', 'Technology', 'Medium', 'UTC', 'USD', 'TAX123', '123 Main St', 'San Francisco', 'USA', '+1-555-0123', 'contact@acme.com', 'https://acme.com', '{"phone": "+1-555-0123", "email": "contact@acme.com"}', '{}', 'basic', 'active', NOW(), NOW()),
            ('org_techstart', 'TechStart Inc', 'techstart', 'techstart.com', 'Technology', 'Small', 'UTC', 'USD', 'TAX456', '456 Tech Ave', 'Austin', 'USA', '+1-555-0456', 'hello@techstart.com', 'https://techstart.com', '{"phone": "+1-555-0456", "email": "hello@techstart.com"}', '{}', 'basic', 'active', NOW(), NOW()),
            ('org_consulting', 'Consulting Partners', 'consulting', 'consulting.com', 'Consulting', 'Large', 'UTC', 'USD', 'TAX789', '789 Business Blvd', 'New York', 'USA', '+1-555-0789', 'info@consulting.com', 'https://consulting.com', '{"phone": "+1-555-0789", "email": "info@consulting.com"}', '{}', 'basic', 'active', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            domain = EXCLUDED.domain,
            industry = EXCLUDED.industry,
            size = EXCLUDED.size,
            currency = EXCLUDED.currency,
            "updatedAt" = NOW();
SQL
    
    log_success "Organizations created"
}

# Create roles
create_roles() {
    log_info "Creating roles..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create roles (idempotent) - Fixed column names
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
        -- Create permissions (idempotent) - Fixed column names
        INSERT INTO permissions (id, name, description, category, resource, action, "createdAt")
        VALUES 
            ('perm_view_quotes', 'View Quotes', 'View quotes and quote details', 'quotes', 'quotes', 'view', NOW()),
            ('perm_create_quotes', 'Create Quotes', 'Create new quotes', 'quotes', 'quotes', 'create', NOW()),
            ('perm_edit_quotes', 'Edit Quotes', 'Edit existing quotes', 'quotes', 'quotes', 'edit', NOW()),
            ('perm_approve_quotes', 'Approve Quotes', 'Approve quotes for sending', 'quotes', 'quotes', 'approve', NOW()),
            ('perm_view_invoices', 'View Invoices', 'View invoices and invoice details', 'invoices', 'invoices', 'view', NOW()),
            ('perm_create_invoices', 'Create Invoices', 'Create new invoices', 'invoices', 'invoices', 'create', NOW()),
            ('perm_edit_invoices', 'Edit Invoices', 'Edit existing invoices', 'invoices', 'invoices', 'edit', NOW()),
            ('perm_view_customers', 'View Customers', 'View customer information', 'customers', 'customers', 'view', NOW()),
            ('perm_create_customers', 'Create Customers', 'Create new customers', 'customers', 'customers', 'create', NOW()),
            ('perm_edit_customers', 'Edit Customers', 'Edit customer information', 'customers', 'customers', 'edit', NOW()),
            ('perm_view_projects', 'View Projects', 'View project information', 'projects', 'projects', 'view', NOW()),
            ('perm_create_projects', 'Create Projects', 'Create new projects', 'projects', 'projects', 'create', NOW()),
            ('perm_edit_projects', 'Edit Projects', 'Edit project information', 'projects', 'projects', 'edit', NOW())
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
            ('rp_admin_1', 'role_admin', 'perm_view_quotes', NOW()),
            ('rp_admin_2', 'role_admin', 'perm_create_quotes', NOW()),
            ('rp_admin_3', 'role_admin', 'perm_edit_quotes', NOW()),
            ('rp_admin_4', 'role_admin', 'perm_approve_quotes', NOW()),
            ('rp_admin_5', 'role_admin', 'perm_view_invoices', NOW()),
            ('rp_admin_6', 'role_admin', 'perm_create_invoices', NOW()),
            ('rp_admin_7', 'role_admin', 'perm_edit_invoices', NOW()),
            ('rp_admin_8', 'role_admin', 'perm_view_customers', NOW()),
            ('rp_admin_9', 'role_admin', 'perm_create_customers', NOW()),
            ('rp_admin_10', 'role_admin', 'perm_edit_customers', NOW()),
            ('rp_admin_11', 'role_admin', 'perm_view_projects', NOW()),
            ('rp_admin_12', 'role_admin', 'perm_create_projects', NOW()),
            ('rp_admin_13', 'role_admin', 'perm_edit_projects', NOW()),
            -- Manager role gets most permissions
            ('rp_manager_1', 'role_manager', 'perm_view_quotes', NOW()),
            ('rp_manager_2', 'role_manager', 'perm_create_quotes', NOW()),
            ('rp_manager_3', 'role_manager', 'perm_edit_quotes', NOW()),
            ('rp_manager_4', 'role_manager', 'perm_view_invoices', NOW()),
            ('rp_manager_5', 'role_manager', 'perm_create_invoices', NOW()),
            ('rp_manager_6', 'role_manager', 'perm_view_customers', NOW()),
            ('rp_manager_7', 'role_manager', 'perm_create_customers', NOW()),
            ('rp_manager_8', 'role_manager', 'perm_view_projects', NOW()),
            ('rp_manager_9', 'role_manager', 'perm_create_projects', NOW()),
            -- User role gets basic permissions
            ('rp_user_1', 'role_user', 'perm_view_quotes', NOW()),
            ('rp_user_2', 'role_user', 'perm_view_invoices', NOW()),
            ('rp_user_3', 'role_user', 'perm_view_customers', NOW()),
            ('rp_user_4', 'role_user', 'perm_view_projects', NOW()),
            -- Customer role gets limited permissions
            ('rp_customer_1', 'role_customer', 'perm_view_quotes', NOW()),
            ('rp_customer_2', 'role_customer', 'perm_view_invoices', NOW())
        ON CONFLICT (id) DO UPDATE SET
            role_id = EXCLUDED.role_id,
            permission_id = EXCLUDED.permission_id;
SQL
    
    log_success "Role permissions created"
}

# Create users
create_users() {
    log_info "Creating users..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create users (idempotent) - Fixed column names
        INSERT INTO users (id, organization_id, email, username, first_name, last_name, display_name, user_type, timezone, locale, date_format, time_format, preferences, metadata, status, email_verified, password_hash, created_at, updated_at)
        VALUES 
            ('user_admin', 'org_acme', 'admin@acme.com', 'admin', 'Admin', 'User', 'Admin User', 'internal', 'UTC', 'en-US', 'DD MMM YYYY', '24h', '{}', '{}', 'active', true, '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
            ('user_manager', 'org_acme', 'manager@acme.com', 'manager', 'Manager', 'User', 'Manager User', 'internal', 'UTC', 'en-US', 'DD MMM YYYY', '24h', '{}', '{}', 'active', true, '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
            ('user_consultant', 'org_acme', 'consultant@acme.com', 'consultant', 'Consultant', 'User', 'Consultant User', 'internal', 'UTC', 'en-US', 'DD MMM YYYY', '24h', '{}', '{}', 'active', true, '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
            ('user_customer1', 'org_acme', 'customer1@acme.com', 'customer1', 'Customer', 'One', 'Customer One', 'customer', 'UTC', 'en-US', 'DD MMM YYYY', '24h', '{}', '{}', 'active', true, '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
            ('user_customer2', 'org_acme', 'customer2@acme.com', 'customer2', 'Customer', 'Two', 'Customer Two', 'customer', 'UTC', 'en-US', 'DD MMM YYYY', '24h', '{}', '{}', 'active', true, '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            username = EXCLUDED.username,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            display_name = EXCLUDED.display_name,
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
            ('ur_customer1', 'user_customer1', 'role_customer', 'org_acme', 'user_admin', NOW(), true),
            ('ur_customer2', 'user_customer2', 'role_customer', 'org_acme', 'user_admin', NOW(), true)
        ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            role_id = EXCLUDED.role_id,
            organization_id = EXCLUDED.organization_id,
            is_active = EXCLUDED.is_active;
SQL
    
    log_success "User roles created"
}

# Create customers
create_customers() {
    log_info "Creating customers..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create customers (idempotent) - Fixed column names
        INSERT INTO customers (id, organization_id, customer_number, company_name, legal_name, industry, website, description, status, customer_type, source, tags, rating, street, city, country, phone, email, contact_extras, created_at, updated_at)
        VALUES 
            ('customer_acme', 'org_acme', 'CUST001', 'ACME Client Corp', 'ACME Client Corporation', 'Technology', 'https://acmeclient.com', 'Primary client for web development', 'active', 'business', 'referral', ARRAY['vip', 'web-dev'], 5, '456 Client St', 'San Francisco', 'USA', '+1-555-1001', 'contact@acmeclient.com', '{"linkedin": "https://linkedin.com/company/acme-client"}', NOW(), NOW()),
            ('customer_techstart', 'org_techstart', 'CUST002', 'TechStart Solutions', 'TechStart Solutions LLC', 'Technology', 'https://techstartsolutions.com', 'Mobile app development client', 'active', 'business', 'website', ARRAY['mobile', 'startup'], 4, '789 Startup Ave', 'Austin', 'USA', '+1-555-2002', 'hello@techstartsolutions.com', '{"twitter": "@techstartsolutions"}', NOW(), NOW()),
            ('customer_consulting', 'org_consulting', 'CUST003', 'Consulting Partners Ltd', 'Consulting Partners Limited', 'Consulting', 'https://consultingpartners.com', 'Business consulting services', 'active', 'business', 'cold-call', ARRAY['enterprise', 'consulting'], 5, '321 Business Blvd', 'New York', 'USA', '+1-555-3003', 'info@consultingpartners.com', '{"linkedin": "https://linkedin.com/company/consulting-partners"}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            customer_number = EXCLUDED.customer_number,
            company_name = EXCLUDED.company_name,
            legal_name = EXCLUDED.legal_name,
            industry = EXCLUDED.industry,
            website = EXCLUDED.website,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            updated_at = NOW();
SQL
    
    log_success "Customers created"
}

# Create projects
create_projects() {
    log_info "Creating projects..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create projects (idempotent) - Fixed column names
        INSERT INTO projects (id, organization_id, name, code, description, status, owner_id, start_date, end_date, metadata, created_at, updated_at)
        VALUES 
            ('project_website', 'org_acme', 'Website Redesign', 'WEB001', 'Complete website redesign and development', 'active', 'user_manager', '2024-01-01', '2024-06-30', '{"budget": 50000, "team_size": 5}', NOW(), NOW()),
            ('project_mobile', 'org_techstart', 'Mobile App Development', 'MOB001', 'Native mobile app for iOS and Android', 'active', 'user_manager', '2024-02-01', '2024-08-31', '{"platforms": ["ios", "android"], "budget": 75000}', NOW(), NOW()),
            ('project_consulting', 'org_consulting', 'Business Consulting', 'CON001', 'Strategic business consulting and analysis', 'active', 'user_manager', '2024-03-01', '2024-12-31', '{"scope": "strategic", "duration": "9 months"}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            code = EXCLUDED.code,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            owner_id = EXCLUDED.owner_id,
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();
SQL
    
    log_success "Projects created"
}

# Create service categories
create_service_categories() {
    log_info "Creating service categories..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create service categories (idempotent) - Fixed column names
        INSERT INTO service_categories (id, organization_id, name, code, description, ordering, is_visible, is_active, metadata, created_at, updated_at)
        VALUES 
            ('cat_development', 'org_acme', 'Development', 'DEV', 'Software development services', 1, true, true, '{"color": "#007bff"}', NOW(), NOW()),
            ('cat_design', 'org_acme', 'Design', 'DES', 'UI/UX design services', 2, true, true, '{"color": "#28a745"}', NOW(), NOW()),
            ('cat_consulting', 'org_acme', 'Consulting', 'CON', 'Business consulting services', 3, true, true, '{"color": "#ffc107"}', NOW(), NOW()),
            ('cat_project_management', 'org_acme', 'Project Management', 'PM', 'Project management services', 4, true, true, '{"color": "#dc3545"}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            code = EXCLUDED.code,
            description = EXCLUDED.description,
            ordering = EXCLUDED.ordering,
            is_visible = EXCLUDED.is_visible,
            is_active = EXCLUDED.is_active,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();
SQL
    
    log_success "Service categories created"
}

# Create rate cards
create_rate_cards() {
    log_info "Creating rate cards..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create rate cards (idempotent) - Fixed column names
        INSERT INTO rate_cards (id, organization_id, name, version, description, currency, effective_from, effective_until, is_default, is_active, metadata, created_at, updated_at)
        VALUES 
            ('rate_standard', 'org_acme', 'Standard Rate Card', '1.0', 'Standard rates for all services', 'USD', '2024-01-01', '2024-12-31', true, true, '{"type": "standard"}', NOW(), NOW()),
            ('rate_premium', 'org_acme', 'Premium Rate Card', '1.0', 'Premium rates for specialized services', 'USD', '2024-01-01', '2024-12-31', false, true, '{"type": "premium"}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            version = EXCLUDED.version,
            description = EXCLUDED.description,
            currency = EXCLUDED.currency,
            effective_from = EXCLUDED.effective_from,
            effective_until = EXCLUDED.effective_until,
            is_default = EXCLUDED.is_default,
            is_active = EXCLUDED.is_active,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();
SQL
    
    log_success "Rate cards created"
}

# Create rate card items
create_rate_card_items() {
    log_info "Creating rate card items..."
    
    psql "$DATABASE_URL" <<-SQL
        -- Create rate card items (idempotent) - Fixed column names
        INSERT INTO rate_card_items (id, rate_card_id, service_category_id, role_id, item_code, unit, base_rate, currency, tax_class, effective_from, effective_until, is_active, metadata, created_at, updated_at)
        VALUES 
            ('rci_dev_senior', 'rate_standard', 'cat_development', 'role_user', 'DEV-SR', 'hour', 150.0000, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{"level": "senior"}', NOW(), NOW()),
            ('rci_dev_junior', 'rate_standard', 'cat_development', 'role_user', 'DEV-JR', 'hour', 100.0000, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{"level": "junior"}', NOW(), NOW()),
            ('rci_design_senior', 'rate_standard', 'cat_design', 'role_user', 'DES-SR', 'hour', 120.0000, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{"level": "senior"}', NOW(), NOW()),
            ('rci_consulting_senior', 'rate_premium', 'cat_consulting', 'role_manager', 'CON-SR', 'hour', 200.0000, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{"level": "senior"}', NOW(), NOW()),
            ('rci_pm_senior', 'rate_standard', 'cat_project_management', 'role_manager', 'PM-SR', 'hour', 180.0000, 'USD', 'standard', '2024-01-01', '2024-12-31', true, '{"level": "senior"}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            rate_card_id = EXCLUDED.rate_card_id,
            service_category_id = EXCLUDED.service_category_id,
            role_id = EXCLUDED.role_id,
            item_code = EXCLUDED.item_code,
            unit = EXCLUDED.unit,
            base_rate = EXCLUDED.base_rate,
            currency = EXCLUDED.currency,
            tax_class = EXCLUDED.tax_class,
            effective_from = EXCLUDED.effective_from,
            effective_until = EXCLUDED.effective_until,
            is_active = EXCLUDED.is_active,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();
SQL
    
    log_success "Rate card items created"
}

# Main execution
main() {
    echo "ℹ️  Starting C2 Seed and Fixtures - Fixed Seed Script"
    
    check_database
    
    # Create data in dependency order
    create_organizations
    create_roles
    create_permissions
    create_role_permissions
    create_users
    create_user_roles
    create_customers
    create_projects
    create_service_categories
    create_rate_cards
    create_rate_card_items
    
    log_success "Fixed seed script completed successfully!"
    
    echo "ℹ️  Created entities:"
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

