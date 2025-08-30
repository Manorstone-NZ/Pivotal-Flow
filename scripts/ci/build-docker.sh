#!/bin/bash

# CI Pipeline: Build Docker Images
# This script builds Docker images for backend and optional frontend

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🏗️ Building Docker images..."

cd "$PROJECT_ROOT/infra/docker"

# Build backend image
echo "📦 Building backend image..."
docker compose -f docker-compose.yml -f docker-compose.app.yml build backend

# Build frontend image (optional)
if [ "${BUILD_FRONTEND:-true}" = "true" ]; then
    echo "🌐 Building frontend image..."
    docker compose -f docker-compose.yml -f docker-compose.app.yml build frontend
else
    echo "⏭️ Skipping frontend build"
fi

echo "✅ Docker images built successfully"

# List built images
echo "📋 Built images:"
docker images | grep -E "(pivotal|backend|frontend)" || echo "No relevant images found"
