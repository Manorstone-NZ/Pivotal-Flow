#!/bin/bash

# Daily PostgreSQL Backup Script for Pivotal Flow
# This script creates daily backups and retains them for 7 days

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="pivotal_flow_backup_${TIMESTAMP}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

# Set defaults if not found
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-pivotal_flow}
DB_USER=${DB_USER:-postgres}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "Starting daily backup of Pivotal Flow database"
log "Database: $DB_NAME on $DB_HOST:$DB_PORT"
log "Backup file: $BACKUP_FILE"

# Create backup using pg_dump
# Note: We use PGPASSWORD environment variable to avoid password in command line
export PGPASSWORD="$DB_PASS"

if pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --no-owner \
    --no-privileges \
    --file="$BACKUP_DIR/$BACKUP_FILE" 2>&1; then
    
    log "Backup completed successfully: $BACKUP_FILE"
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log "Backup size: $BACKUP_SIZE"
    
    # Verify backup file exists and has content
    if [[ -s "$BACKUP_DIR/$BACKUP_FILE" ]]; then
        log "Backup file verified successfully"
    else
        error "Backup file is empty or missing"
        exit 1
    fi
    
else
    error "Backup failed"
    exit 1
fi

# Clean up old backups (keep only last 7 days)
log "Cleaning up old backups (keeping last $RETENTION_DAYS days)"

# Find and remove old backup files
find "$BACKUP_DIR" -name "pivotal_flow_backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# List remaining backups
REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "pivotal_flow_backup_*.sql" -type f | wc -l)
log "Remaining backups: $REMAINING_BACKUPS"

# Create a symlink to the latest backup for easy access
LATEST_BACKUP="$BACKUP_DIR/latest_backup.sql"
if [[ -L "$LATEST_BACKUP" ]]; then
    rm "$LATEST_BACKUP"
fi
ln -s "$BACKUP_FILE" "$LATEST_BACKUP"

log "Daily backup process completed successfully"
log "Latest backup: $BACKUP_FILE -> $LATEST_BACKUP"

# Clean up environment variable
unset PGPASSWORD

exit 0
