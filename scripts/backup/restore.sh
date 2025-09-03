#!/bin/bash

# PostgreSQL Restore Script for Pivotal Flow
# This script restores a backup file to a fresh database

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Show usage
show_usage() {
    echo "Usage: $0 <backup_file> [options]"
    echo ""
    echo "Arguments:"
    echo "  backup_file    Path to the backup file to restore"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -f, --force    Force restore without confirmation"
    echo "  -d, --database Database name to restore to (default: pivotal_flow_restore)"
    echo "  -D, --drop     Drop existing database if it exists"
    echo ""
    echo "Examples:"
    echo "  $0 backups/pivotal_flow_backup_20241201_120000.sql"
    echo "  $0 backups/latest_backup.sql -d my_test_db -D"
    echo ""
    echo "Note: This script will create a new database for the restore operation."
    echo "      The original database will not be affected."
}

# Parse command line arguments
BACKUP_FILE=""
FORCE=false
DB_NAME="pivotal_flow_restore"
DROP_EXISTING=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        -D|--drop)
            DROP_EXISTING=true
            shift
            ;;
        -*)
            error "Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            if [[ -z "$BACKUP_FILE" ]]; then
                BACKUP_FILE="$1"
            else
                error "Multiple backup files specified: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# Check if backup file is specified
if [[ -z "$BACKUP_FILE" ]]; then
    error "Backup file not specified"
    show_usage
    exit 1
fi

# Check if backup file exists
if [[ ! -f "$BACKUP_FILE" ]]; then
    error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Check if backup file is readable
if [[ ! -r "$BACKUP_FILE" ]]; then
    error "Backup file is not readable: $BACKUP_FILE"
    exit 1
fi

# Check if .env file exists
if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
    error "Environment file not found at $PROJECT_ROOT/.env"
    error "Please ensure you have a .env file with database connection details"
    exit 1
fi

# Source environment variables
source "$PROJECT_ROOT/.env"

# Validate required environment variables
if [[ -z "${DATABASE_URL:-}" ]]; then
    error "DATABASE_URL not found in environment"
    exit 1
fi

# Extract database connection details from DATABASE_URL
# Format: postgresql://username:password@host:port/database
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
ORIGINAL_DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

# Set defaults if not found
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
ORIGINAL_DB_NAME=${ORIGINAL_DB_NAME:-pivotal_flow}
DB_USER=${DB_USER:-postgres}

# Get backup file info
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_DATE=$(stat -c %y "$BACKUP_FILE" | cut -d' ' -f1)

log "PostgreSQL Restore Script for Pivotal Flow"
log "=========================================="
log "Backup file: $BACKUP_FILE"
log "Backup size: $BACKUP_SIZE"
log "Backup date: $BACKUP_DATE"
log "Target database: $DB_NAME"
log "Source database: $ORIGINAL_DB_NAME"
log "Database host: $DB_HOST:$DB_PORT"
log "Database user: $DB_USER"

# Safety check - don't restore to the original database
if [[ "$DB_NAME" == "$ORIGINAL_DB_NAME" ]]; then
    error "Cannot restore to the original database: $ORIGINAL_DB_NAME"
    error "Please specify a different database name using -d option"
    exit 1
fi

# Confirmation prompt (unless --force is used)
if [[ "$FORCE" != true ]]; then
    echo ""
    warn "This will create/overwrite database: $DB_NAME"
    warn "Original database: $ORIGINAL_DB_NAME will NOT be affected"
    echo ""
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restore cancelled by user"
        exit 0
    fi
fi

# Set PGPASSWORD for authentication
export PGPASSWORD="$DB_PASS"

# Check if target database exists
DB_EXISTS=$(psql --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USER" --tuples-only --command="SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" 2>/dev/null | grep -c 1 || echo "0")

if [[ "$DB_EXISTS" -gt 0 ]]; then
    if [[ "$DROP_EXISTING" == true ]]; then
        warn "Dropping existing database: $DB_NAME"
        psql --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USER" --command="DROP DATABASE \"$DB_NAME\";" 2>/dev/null || true
        DB_EXISTS=0
    else
        error "Database $DB_NAME already exists"
        error "Use -D flag to drop existing database, or specify a different name with -d"
        unset PGPASSWORD
        exit 1
    fi
fi

# Create new database if it doesn't exist
if [[ "$DB_EXISTS" -eq 0 ]]; then
    log "Creating new database: $DB_NAME"
    if ! ALLOW_LOCAL_DB_CREATION=yes psql --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USER" --command="CREATE DATABASE \"$DB_NAME\";"; then
        error "Failed to create database: $DB_NAME"
        unset PGPASSWORD
        exit 1
    fi
    log "Database created successfully"
fi

# Restore the backup
log "Starting restore process..."
log "This may take several minutes depending on backup size..."

RESTORE_START=$(date +%s)

if pg_restore \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --verbose \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    "$BACKUP_FILE" 2>&1; then
    
    RESTORE_END=$(date +%s)
    RESTORE_DURATION=$((RESTORE_END - RESTORE_START))
    
    log "Restore completed successfully!"
    log "Restore duration: ${RESTORE_DURATION} seconds"
    
    # Verify restore by checking some key tables
    log "Verifying restore..."
    
    # Check if key tables exist
    TABLE_COUNT=$(psql --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USER" --dbname="$DB_NAME" --tuples-only --command="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
    
    if [[ "$TABLE_COUNT" -gt 0 ]]; then
        log "Restore verification successful: $TABLE_COUNT tables found"
        
        # Show some table names for verification
        TABLES=$(psql --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USER" --dbname="$DB_NAME" --tuples-only --command="SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 5;" 2>/dev/null | tr '\n' ' ' || echo "None")
        log "Sample tables: $TABLES"
        
    else
        warn "Restore verification incomplete: No tables found"
    fi
    
    log ""
    log "Database '$DB_NAME' is now ready for use"
    log "Connection string: postgresql://$DB_USER:****@$DB_HOST:$DB_PORT/$DB_NAME"
    
else
    error "Restore failed"
    unset PGPASSWORD
    exit 1
fi

# Clean up environment variable
unset PGPASSWORD

log "Restore process completed successfully"
exit 0
