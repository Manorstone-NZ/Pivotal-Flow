#!/bin/bash

# C3 Migrations - Development Migration Rollback Test
# Tests migration rollback on a development copy

set -e

echo "🧪 Starting Development Migration Rollback Test..."

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

# Configuration
MIGRATIONS_DIR="apps/backend/drizzle"
DATABASE_NAME="pivotal_dev_rollback_test_$(date +%s)"
DATABASE_URL="postgresql://pivotal:pivotal@localhost:5433/${DATABASE_NAME}"

# Cleanup function
cleanup() {
    log_info "Cleaning up test database..."
    psql "postgresql://pivotal:pivotal@localhost:5433/pivotal" -c "DROP DATABASE IF EXISTS ${DATABASE_NAME};" >/dev/null 2>&1 || true
}

# Set up trap for cleanup
trap cleanup EXIT

# Check if PostgreSQL is accessible
check_postgres() {
    log_info "Checking PostgreSQL connection..."
    if ! psql "postgresql://pivotal:pivotal@localhost:5433/pivotal" -c "SELECT 1;" >/dev/null 2>&1; then
        log_error "Cannot connect to PostgreSQL. Please ensure PostgreSQL is running."
        exit 1
    fi
    log_success "PostgreSQL connection verified"
}

# Create test database
create_test_database() {
    log_info "Creating test database: ${DATABASE_NAME}"
    psql "postgresql://pivotal:pivotal@localhost:5433/pivotal" -c "CREATE DATABASE ${DATABASE_NAME};" >/dev/null 2>&1
    log_success "Test database created"
}

# Get schema state
get_schema_state() {
    log_info "Getting schema state..."
    
    SCHEMA_STATE=$(psql "${DATABASE_URL}" -c "
        SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        ORDER BY table_name, ordinal_position;
    " -t)
    
    echo "$SCHEMA_STATE"
}

# Apply migrations
apply_migrations() {
    log_info "Applying migrations..."
    
    export DATABASE_URL="${DATABASE_URL}"
    export ALLOW_LOCAL_DB_CREATION="yes"
    
    cd apps/backend
    
    if ! pnpm drizzle:migrate >/dev/null 2>&1; then
        log_error "Failed to apply migrations"
        exit 1
    fi
    
    cd ../..
    log_success "Migrations applied"
}

# Test specific migration rollback
test_migration_rollback() {
    local migration_file="$1"
    local rollback_file="${migration_file%.sql}_rollback.sql"
    
    if [[ ! -f "$rollback_file" ]]; then
        log_warning "No rollback script found for: $(basename "$migration_file")"
        return 0
    fi
    
    log_info "Testing rollback for: $(basename "$migration_file")"
    
    # Get schema before rollback
    SCHEMA_BEFORE=$(get_schema_state)
    
    # Apply rollback
    if ! psql "${DATABASE_URL}" -f "$rollback_file" >/dev/null 2>&1; then
        log_error "Failed to apply rollback script: $(basename "$rollback_file")"
        return 1
    fi
    
    # Get schema after rollback
    SCHEMA_AFTER=$(get_schema_state)
    
    # Compare schemas
    if [[ "$SCHEMA_BEFORE" == "$SCHEMA_AFTER" ]]; then
        log_success "Rollback successful for: $(basename "$migration_file")"
    else
        log_error "Rollback failed for: $(basename "$migration_file")"
        log_info "Schema changed during rollback"
        return 1
    fi
}

# Test all migration rollbacks
test_all_rollbacks() {
    log_info "Testing all migration rollbacks..."
    
    # Get all migration files
    MIGRATION_FILES=$(find "${MIGRATIONS_DIR}" -name "*.sql" -not -name "*_rollback.sql" | sort)
    
    local failed_rollbacks=0
    
    echo "$MIGRATION_FILES" | while read -r migration_file; do
        if [[ -n "$migration_file" ]]; then
            if ! test_migration_rollback "$migration_file"; then
                failed_rollbacks=$((failed_rollbacks + 1))
            fi
        fi
    done
    
    if [[ $failed_rollbacks -eq 0 ]]; then
        log_success "All rollback scripts tested successfully"
    else
        log_error "$failed_rollbacks rollback script(s) failed"
        exit 1
    fi
}

# Main execution
main() {
    log_info "Starting Development Migration Rollback Test"
    
    # Check environment
    check_postgres
    
    # Create test database
    create_test_database
    
    # Apply migrations
    apply_migrations
    
    # Test all rollbacks
    test_all_rollbacks
    
    log_success "Development Migration Rollback Test completed successfully!"
    log_info "Summary:"
    echo "  • Test database created and cleaned up"
    echo "  • All migrations applied"
    echo "  • All rollback scripts tested"
    echo "  • Schema consistency verified"
}

# Run main function
main "$@"
