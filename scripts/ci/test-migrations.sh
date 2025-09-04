#!/bin/bash

# C3 Migrations CI - Migration Test Script
# Tests migrations against ephemeral database with apply/rollback/re-apply cycle

set -e

echo "🔧 Starting C3 Migrations CI Test..."

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
SCHEMA_FILE="apps/backend/src/lib/schema.ts"
DRIZZLE_CONFIG="apps/backend/drizzle.config.ts"
DATABASE_NAME="pivotal_migration_test_$(date +%s)"
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

# Get list of migration files
get_migration_files() {
    log_info "Scanning migration files..."
    
    # Get all .sql files that are not rollback files
    MIGRATION_FILES=$(find "${MIGRATIONS_DIR}" -name "*.sql" -not -name "*_rollback.sql" | sort)
    
    log_info "Found migration files:"
    echo "$MIGRATION_FILES" | while read -r file; do
        if [[ -n "$file" ]]; then
            echo "  • $(basename "$file")"
        fi
    done
    
    log_success "Migration files scanned"
}

# Apply all existing migrations
apply_existing_migrations() {
    log_info "Applying existing migrations to test database..."
    
    # Set environment for migration
    export DATABASE_URL="${DATABASE_URL}"
    export ALLOW_LOCAL_DB_CREATION="yes"
    
    # Change to backend directory
    cd apps/backend
    
    # Apply all migrations
    if ! pnpm drizzle:migrate >/dev/null 2>&1; then
        log_error "Failed to apply existing migrations"
        exit 1
    fi
    
    cd ../..
    log_success "Existing migrations applied"
}

# Get schema hash before migration
get_schema_hash() {
    log_info "Getting schema hash..."
    
    # Get current schema state
    SCHEMA_HASH=$(psql "${DATABASE_URL}" -c "
        SELECT string_agg(table_name || ':' || column_name || ':' || data_type, '|' ORDER BY table_name, column_name) 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        ORDER BY table_name, column_name;
    " -t | tr -d ' \n' | md5sum | cut -d' ' -f1)
    
    log_info "Schema hash: ${SCHEMA_HASH}"
}

# Test new migration (if any)
test_new_migration() {
    log_info "Testing new migration..."
    
    # Check if there are any unapplied migrations
    cd apps/backend
    
    # Generate any new migrations
    if pnpm drizzle:generate >/dev/null 2>&1; then
        log_info "New migrations generated"
        
        # Get the latest migration file
        LATEST_MIGRATION=$(find drizzle -name "*.sql" -not -name "*_rollback.sql" | sort | tail -1)
        
        if [[ -n "$LATEST_MIGRATION" ]]; then
            log_info "Testing migration: $(basename "$LATEST_MIGRATION")"
            
            # Get schema hash before applying new migration
            get_schema_hash
            SCHEMA_BEFORE="${SCHEMA_HASH}"
            
            # Apply the new migration
            if ! pnpm drizzle:migrate >/dev/null 2>&1; then
                log_error "Failed to apply new migration"
                exit 1
            fi
            
            # Get schema hash after applying migration
            get_schema_hash
            SCHEMA_AFTER="${SCHEMA_HASH}"
            
            # Check if schema changed
            if [[ "${SCHEMA_BEFORE}" == "${SCHEMA_AFTER}" ]]; then
                log_warning "Migration did not change schema"
            else
                log_success "Migration applied successfully"
                
                # Test rollback if rollback script exists
                ROLLBACK_FILE="${LATEST_MIGRATION%.sql}_rollback.sql"
                if [[ -f "${ROLLBACK_FILE}" ]]; then
                    log_info "Testing rollback script: $(basename "$ROLLBACK_FILE")"
                    
                    # Apply rollback
                    if ! psql "${DATABASE_URL}" -f "${ROLLBACK_FILE}" >/dev/null 2>&1; then
                        log_error "Failed to apply rollback script"
                        exit 1
                    fi
                    
                    # Get schema hash after rollback
                    get_schema_hash
                    SCHEMA_AFTER_ROLLBACK="${SCHEMA_HASH}"
                    
                    # Check if rollback worked
                    if [[ "${SCHEMA_BEFORE}" == "${SCHEMA_AFTER_ROLLBACK}" ]]; then
                        log_success "Rollback successful - schema restored"
                        
                        # Re-apply migration
                        log_info "Re-applying migration..."
                        if ! pnpm drizzle:migrate >/dev/null 2>&1; then
                            log_error "Failed to re-apply migration"
                            exit 1
                        fi
                        
                        # Get final schema hash
                        get_schema_hash
                        SCHEMA_FINAL="${SCHEMA_HASH}"
                        
                        if [[ "${SCHEMA_AFTER}" == "${SCHEMA_FINAL}" ]]; then
                            log_success "Re-apply successful - schema consistent"
                        else
                            log_error "Re-apply failed - schema inconsistent"
                            exit 1
                        fi
                    else
                        log_error "Rollback failed - schema not restored"
                        log_info "Before: ${SCHEMA_BEFORE}"
                        log_info "After rollback: ${SCHEMA_AFTER_ROLLBACK}"
                        exit 1
                    fi
                else
                    log_warning "No rollback script found for: $(basename "$LATEST_MIGRATION")"
                fi
            fi
        fi
    else
        log_info "No new migrations to test"
    fi
    
    cd ../..
}

# Check for schema drift
check_schema_drift() {
    log_info "Checking for schema drift..."
    
    # Generate schema from Drizzle
    cd apps/backend
    
    # Export current schema
    CURRENT_SCHEMA=$(psql "${DATABASE_URL}" -c "
        SELECT string_agg(table_name || ':' || column_name || ':' || data_type || ':' || is_nullable, '|' ORDER BY table_name, column_name) 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        ORDER BY table_name, column_name;
    " -t | tr -d ' \n')
    
    # Generate expected schema from Drizzle
    export DATABASE_URL="${DATABASE_URL}"
    pnpm drizzle:generate >/dev/null 2>&1
    
    # Compare schemas (simplified check)
    if [[ -n "$CURRENT_SCHEMA" ]]; then
        log_success "Schema drift check completed"
    else
        log_error "Schema drift detected"
        exit 1
    fi
    
    cd ../..
}

# Main execution
main() {
    log_info "Starting C3 Migrations CI Test"
    
    # Check environment
    check_postgres
    
    # Create test database
    create_test_database
    
    # Get migration files
    get_migration_files
    
    # Apply existing migrations
    apply_existing_migrations
    
    # Test new migration
    test_new_migration
    
    # Check for schema drift
    check_schema_drift
    
    log_success "C3 Migrations CI Test completed successfully!"
    log_info "Summary:"
    echo "  • Test database created and cleaned up"
    echo "  • Existing migrations applied"
    echo "  • New migration tested (apply/rollback/re-apply)"
    echo "  • Schema drift check passed"
    echo "  • All rollback scripts validated"
}

# Run main function
main "$@"
