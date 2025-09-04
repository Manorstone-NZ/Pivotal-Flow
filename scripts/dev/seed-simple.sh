#!/bin/bash

# C2 Seed and Fixtures - Simplified Seed Script
# Creates basic organizations, users, and service categories
# Idempotent and safe to re-run

set -e

echo "🌱 Starting simplified database seed..."

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
        INSERT INTO organizations (id, name, slug, domain, industry, size, timezone, currency, "taxId", address, "contactInfo", settings, "subscriptionPlan", "subscriptionStatus", "createdAt", "updatedAt")
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
            "updatedAt" = NOW();
SQL
    
    log_success "Organizations created"
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

# Main execution
main() {
    log_info "Starting C2 Seed and Fixtures - Simplified Seed Script"
    
    check_database
    create_organizations
    create_service_categories
    
    log_success "Simplified seed script completed successfully!"
    log_info "Created entities:"
    echo "  • Organizations: org_acme, org_techstart, org_consulting"
    echo "  • Service Categories: cat_development, cat_design, cat_consulting, cat_project_management"
}

# Run main function
main "$@"
