#!/bin/bash

# Container Restore Script for Pivotal Flow
# This script restores backups from within the Docker compose network

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
BACKUP_DIR="/var/lib/postgresql/data"

# Function to display usage
usage() {
    echo "Usage: $0 <backup_file> [options]"
    echo ""
    echo "Arguments:"
    echo "  backup_file    Backup file to restore (e.g., backup_2024-12-01.dump)"
    echo ""
    echo "Options:"
    echo "  -d, --database NAME    Database name to restore to (default: creates new database)"
    echo "  -f, --force            Force restore without confirmation"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backup_2024-12-01.dump"
    echo "  $0 backup_2024-12-01.dump -d pivotal_restored"
    echo ""
    exit 1
}

# Parse command line arguments
BACKUP_FILE=""
NEW_DB_NAME=""
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--database)
            NEW_DB_NAME="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            if [ -z "$BACKUP_FILE" ]; then
                BACKUP_FILE="$1"
            else
                echo "❌ Unknown argument: $1"
                usage
            fi
            shift
            ;;
    esac
end

# Validate backup file argument
if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Backup file is required"
    usage
fi

# Source environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
else
    echo "❌ .env file not found"
    exit 1
fi

# Extract database details from DATABASE_URL or individual variables
if [ -n "${DATABASE_URL:-}" ]; then
    # Parse DATABASE_URL
    DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
else
    # Use individual variables
    DB_USER="${POSTGRES_USER:-pivotal}"
    DB_PASS="${POSTGRES_PASSWORD:-pivotal}"
    DB_HOST="${POSTGRES_HOST:-postgres}"
    DB_PORT="${POSTGRES_PORT:-5432}"
    DB_NAME="${POSTGRES_DB:-pivotal}"
fi

# Set target database name
TARGET_DB="${NEW_DB_NAME:-${DB_NAME}_restored_$(date +%s)}"

echo "🗄️ Container Database Restore"
echo "📊 Source backup: $BACKUP_FILE"
echo "📊 Target database: $TARGET_DB"
echo "👤 User: $DB_USER"
echo "🏠 Host: $DB_HOST:$DB_PORT"

# Check if backup file exists in container
echo "🔍 Checking backup file..."
if ! docker exec "$(docker ps -qf name=postgres)" test -f "$BACKUP_DIR/$BACKUP_FILE"; then
    echo "❌ Backup file not found: $BACKUP_DIR/$BACKUP_FILE"
    echo "Available backups:"
    docker exec "$(docker ps -qf name=postgres)" ls -la "$BACKUP_DIR"/backup_*.dump 2>/dev/null || echo "No backups found"
    exit 1
fi

# Safety check - don't restore to the original database
if [ "$TARGET_DB" = "$DB_NAME" ]; then
    echo "❌ Cannot restore to the original database: $DB_NAME"
    echo "Use -d option to specify a different database name"
    exit 1
fi

# Confirmation prompt (unless forced)
if [ "$FORCE" != true ]; then
    echo ""
    echo "⚠️  WARNING: This will create a new database: $TARGET_DB"
    echo "📁 Backup file: $BACKUP_FILE"
    echo ""
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Restore cancelled"
        exit 1
    fi
fi

# Create new database if it doesn't exist
echo "🏗️ Creating target database: $TARGET_DB"
ALLOW_LOCAL_DB_CREATION=yes docker exec -e PGPASSWORD="$DB_PASS" \
    "$(docker ps -qf name=postgres)" \
    createdb -U "$DB_USER" "$TARGET_DB"

# Restore the backup
echo "🔄 Restoring backup to $TARGET_DB..."
docker exec -e PGPASSWORD="$DB_PASS" \
    "$(docker ps -qf name=postgres)" \
    pg_restore -U "$DB_USER" -d "$TARGET_DB" -v "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Restore completed successfully"
    
    # Verify restore
    echo "🔍 Verifying restore..."
    table_count=$(docker exec -e PGPASSWORD="$DB_PASS" \
        "$(docker ps -qf name=postgres)" \
        psql -U "$DB_USER" -d "$TARGET_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    echo "📊 Tables restored: $table_count"
    
    if [ "$table_count" -gt 0 ]; then
        echo "✅ Restore verification successful"
        echo "🎯 Database $TARGET_DB is ready for use"
    else
        echo "⚠️  Warning: No tables found in restored database"
    fi
else
    echo "❌ Restore failed"
    exit 1
fi
