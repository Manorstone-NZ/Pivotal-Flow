#!/bin/bash

# CI Pipeline: API Smoke Test
# This script tests health and metrics endpoints of the backend container

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🧪 Running API smoke tests..."

cd "$PROJECT_ROOT/infra/docker"

# Start backend container
echo "🚀 Starting backend container..."
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d backend

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be healthy..."
retry=0
max_retries=30
until curl -fsS http://localhost:3000/health || [ $retry -gt $max_retries ]; do
    echo "Attempt $((retry + 1))/$((max_retries + 1)): Backend not ready yet..."
    sleep 2
    retry=$((retry + 1))
done

if [ $retry -gt $max_retries ]; then
    echo "❌ Backend failed to become healthy within timeout"
    docker compose -f docker-compose.yml -f docker-compose.app.yml logs backend
    exit 1
fi

echo "✅ Backend is healthy"

# Test health endpoint
echo "🏥 Testing health endpoint..."
health_response=$(curl -fsS http://localhost:3000/health)
echo "Health response: $health_response"

# Test metrics endpoint
echo "📊 Testing metrics endpoint..."
metrics_response=$(curl -fsS http://localhost:3000/metrics | head -n 20)
echo "Metrics response (first 20 lines):"
echo "$metrics_response"

# Verify specific metrics
echo "🔍 Verifying key metrics..."
if echo "$metrics_response" | grep -q "process_cpu_seconds_total"; then
    echo "✅ CPU metrics found"
else
    echo "❌ CPU metrics not found"
    exit 1
fi

if echo "$metrics_response" | grep -q "pivotal_cache_hits_total"; then
    echo "✅ Cache metrics found"
else
    echo "❌ Cache metrics not found"
    exit 1
fi

echo "✅ All API smoke tests passed"

# Cleanup
echo "🧹 Cleaning up..."
docker compose -f docker-compose.yml -f docker-compose.app.yml down
