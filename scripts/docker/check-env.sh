#!/usr/bin/env bash

# Docker Environment Check Script
# This script ensures Docker services are running before development work

set -e

echo "🔍 Checking Docker development environment..."

# Check if Docker is running
if ! sudo docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if services are running
if ! sudo docker compose -f infra/docker/docker-compose.yml ps | grep -q "Up"; then
    echo "❌ Docker services are not running."
    echo "Please start the Docker stack first:"
    echo "  ./scripts/docker/up.sh"
    exit 1
fi

# Check PostgreSQL
if ! sudo docker compose -f infra/docker/docker-compose.yml exec -T postgres pg_isready -U pivotal > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not healthy."
    echo "Please wait for services to be ready or restart:"
    echo "  ./scripts/docker/up.sh"
    exit 1
fi

# Check Redis
if ! sudo docker compose -f infra/docker/docker-compose.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not healthy."
    echo "Please wait for services to be ready or restart:"
    echo "  ./scripts/docker/up.sh"
    exit 1
fi

# Check if backend is running (optional)
if sudo docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml ps backend 2>/dev/null | grep -q "Up"; then
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Backend is running and healthy"
    else
        echo "⚠️  Backend is running but health check failed"
    fi
else
    echo "ℹ️  Backend is not running. Start it with:"
    echo "  ./scripts/docker/start-backend.sh"
fi

echo "✅ Docker environment is ready for development!"
echo ""
echo "📊 Services:"
echo "  • PostgreSQL: localhost:5433"
echo "  • Redis: localhost:6379"
echo "  • Prometheus: http://localhost:9090"
echo "  • Grafana: http://localhost:3001"
echo ""
echo "🔧 Environment variables:"
echo "  DATABASE_URL=postgresql://pivotal:pivotal@localhost:5433/pivotal"
echo "  REDIS_URL=redis://localhost:6379"
echo ""
echo "📖 For more information:"
echo "  docs/docker/DOCKER_DEVELOPMENT_INSTRUCTIONS.md"
echo "  docs/docker/DOCKER_QUICK_REFERENCE.md"
