#!/usr/bin/env bash

# Pivotal Flow - Redis CLI Connection Script
# This script connects to the Redis instance in the Docker container

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
if ! sudo docker compose -f infra/docker/docker-compose.yml ps --services --filter "status=running" | grep -q "^redis$"; then
    echo "❌ Redis service is not running."
    echo "💡 Start services with: ./scripts/docker/up.sh"
    exit 1
fi

# Check if Redis is healthy
if ! sudo docker compose -f infra/docker/docker-compose.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis is not healthy yet. Please wait a moment and try again."
    exit 1
fi

echo "🔴 Connecting to Redis..."
echo "💡 Host: localhost:6379"
echo "💡 Press Ctrl+C to exit"
echo ""

# Connect to Redis
sudo docker compose -f infra/docker/docker-compose.yml exec redis redis-cli
