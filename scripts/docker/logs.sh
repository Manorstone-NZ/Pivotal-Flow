#!/usr/bin/env bash

# Pivotal Flow - Docker Development Stack Logs Script
# This script shows logs for all services or a specific service

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
if ! sudo docker compose -f infra/docker/docker-compose.yml ps --services --filter "status=running" | grep -q .; then
    echo "❌ No services are currently running."
    echo "💡 Start services with: ./scripts/docker/up.sh"
    exit 1
fi

# Show logs for specific service or all services
if [ -z "$1" ]; then
    echo "📋 Showing logs for all services..."
    echo "💡 To show logs for a specific service: ./scripts/docker/logs.sh <service-name>"
    echo "💡 Available services: postgres, redis, prometheus, grafana"
    echo ""
    sudo docker compose -f infra/docker/docker-compose.yml logs -f
else
    SERVICE_NAME="$1"
    
    # Check if service exists
    if ! sudo docker compose -f infra/docker/docker-compose.yml ps --services | grep -q "^${SERVICE_NAME}$"; then
        echo "❌ Service '$SERVICE_NAME' not found."
        echo "💡 Available services: postgres, redis, prometheus, grafana"
        exit 1
    fi
    
    # Check if service is running
    if ! sudo docker compose -f infra/docker/docker-compose.yml ps --services --filter "status=running" | grep -q "^${SERVICE_NAME}$"; then
        echo "⚠️  Service '$SERVICE_NAME' not running."
        echo "💡 Start services with: ./scripts/docker/up.sh"
        exit 1
    fi
    
    echo "📋 Showing logs for service: $SERVICE_NAME"
    echo "💡 Press Ctrl+C to stop following logs"
    echo ""
    sudo docker compose -f infra/docker/docker-compose.yml logs -f "$SERVICE_NAME"
fi
