#!/bin/bash

# Container Backup Script for Pivotal Flow
# This script creates backups from within the Docker compose network

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
BACKUP_DIR="/var/lib/postgresql/data"
RETENTION_DAYS=7
TIMESTAMP=$(date +%F_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.dump"

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

echo "🗄️ Creating container backup..."
echo "📊 Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo "👤 User: $DB_USER"
echo "📁 Backup file: $BACKUP_FILE"

# Create backup using pg_dump from postgres container
echo "💾 Creating backup..."
docker exec -e PGPASSWORD="$DB_PASS" \
    "$(docker ps -qf name=postgres)" \
    pg_dump -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    
    # List backups
    echo "📋 Available backups:"
    docker exec "$(docker ps -qf name=postgres)" \
        ls -la "$BACKUP_DIR"/backup_*.dump 2>/dev/null || echo "No backups found"
    
    # Clean up old backups
    echo "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
    docker exec "$(docker ps -qf name=postgres)" \
        find "$BACKUP_DIR" -name "backup_*.dump" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    echo "✅ Backup process completed"
else
    echo "❌ Backup failed"
    exit 1
fi
