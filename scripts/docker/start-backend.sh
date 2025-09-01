#!/usr/bin/env bash

# Pivotal Flow - Backend Startup Script
# This script starts the backend service in Docker

set -e

echo "🚀 Starting Pivotal Flow Backend..."

# Check if Docker is running
if ! sudo docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Navigate to the docker directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT/infra/docker"

# Start the backend service
echo "🔧 Starting backend service..."
sudo docker compose -f docker-compose.yml -f docker-compose.app.yml up -d backend

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 10

# Check backend health
echo "🔍 Checking backend health..."
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    echo "Backend logs:"
    sudo docker compose -f docker-compose.yml -f docker-compose.app.yml logs backend --tail=10
    exit 1
fi

echo ""
echo "🎉 Backend is running!"
echo ""
echo "📋 Services:"
echo "- Backend: http://localhost:3000"
echo "- Health: http://localhost:3000/health"
echo "- Metrics: http://localhost:3000/metrics"
echo ""
echo "🔧 Useful commands:"
echo "  • View logs: sudo docker compose -f docker-compose.yml -f docker-compose.app.yml logs backend -f"
echo "  • Stop backend: sudo docker compose -f docker-compose.yml -f docker-compose.app.yml stop backend"
echo "  • Restart backend: sudo docker compose -f docker-compose.yml -f docker-compose.app.yml restart backend"
echo ""
echo "✅ Backend ready for development!"
