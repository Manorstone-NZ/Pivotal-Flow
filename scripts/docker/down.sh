#!/usr/bin/env bash

# Pivotal Flow - Docker Development Stack Shutdown Script
# This script stops the local development environment

set -e

echo "🛑 Stopping Pivotal Flow development stack..."

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
if ! sudo docker compose -f infra/docker/docker-compose.yml ps --services --filter "status=running" | grep -q .; then
    echo "ℹ️  No services are currently running."
    exit 0
fi

# Handle volume removal option
if [ "$1" = "--volumes" ]; then
    echo "🗑️  Stopping services and removing volumes..."
    sudo docker compose -f infra/docker/docker-compose.yml down -v
    echo "✅ Services stopped and volumes removed."
    echo ""
    echo "💡 To recreate the environment from scratch, run: ./scripts/docker/up.sh"
else
    echo "⏸️  Stopping services (volumes preserved)..."
    sudo docker compose -f infra/docker/docker-compose.yml down
    echo "✅ Services stopped. Volumes preserved for next startup."
    echo ""
    echo "💡 To restart services: ./scripts/docker/up.sh"
    echo "💡 To remove volumes: ./scripts/docker/down.sh --volumes"
fi

echo ""
echo "🔧 Individual volume removal commands:"
echo "  • PostgreSQL: docker volume rm pivotal_pgdata"
echo "  • Redis: docker volume rm pivotal_redisdata"
echo "  • Prometheus: docker volume rm pivotal_prometheus_data"
echo "  • Grafana: docker volume rm pivotal_grafanadata"
