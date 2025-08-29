#!/usr/bin/env bash

# Pivotal Flow - PostgreSQL Connection Script
# This script connects to the PostgreSQL database in the Docker container

set -e

# Navigate to the project root (assuming script is run from project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

# Check if docker-compose is available
if ! command -v docker compose > /dev/null 2>&1; then
    echo "❌ Docker Compose is not available. Please install Docker Compose and try again."
    exit 1
fi

# Check if services are running
if ! sudo docker compose -f infra/docker/docker-compose.yml ps --services --filter "status=running" | grep -q "^postgres$"; then
    echo "❌ PostgreSQL service is not running."
    echo "💡 Start services with: ./scripts/docker/up.sh"
    exit 1
fi

# Check if PostgreSQL is healthy
if ! sudo docker compose -f infra/docker/docker-compose.yml exec -T postgres pg_isready -U pivotal > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not healthy yet. Please wait a moment and try again."
    exit 1
fi

# Load environment variables if .env exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Set default values if not in environment
POSTGRES_USER=${POSTGRES_USER:-pivotal}
POSTGRES_DB=${POSTGRES_DB:-pivotal}

echo "🐘 Connecting to PostgreSQL database..."
echo "💡 Database: $POSTGRES_DB"
echo "💡 User: $POSTGRES_USER"
echo "💡 Host: localhost:5433"
echo "💡 Press Ctrl+D to exit"
echo ""

# Connect to PostgreSQL
sudo docker compose -f infra/docker/docker-compose.yml exec postgres \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
