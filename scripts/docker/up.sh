#!/usr/bin/env bash

# Pivotal Flow - Docker Development Stack Startup Script
# This script starts the local development environment with PostgreSQL, Redis, Prometheus, and Grafana

set -e

echo "🐳 Starting Pivotal Flow development stack..."

# Check if Docker is running
if ! sudo docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker compose > /dev/null 2>&1; then
    echo "❌ Docker Compose is not available. Please install Docker Compose and try again."
    exit 1
fi

# Navigate to the project root (assuming script is run from project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

# Check if .env file exists, if not create from example
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        echo "📝 Creating .env file from env.example..."
        cp env.example .env
        echo "✅ .env file created. Please review and update any sensitive values."
    else
        echo "⚠️  No .env or env.example file found. Using default values."
    fi
fi

# Start the services
echo "🚀 Starting services..."
sudo docker compose -f infra/docker/docker-compose.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
if sudo docker compose -f infra/docker/docker-compose.yml exec -T postgres pg_isready -U pivotal > /dev/null 2>&1; then
    echo "✅ PostgreSQL is healthy"
else
    echo "⚠️  PostgreSQL health check failed, but service may still be starting..."
fi

# Check Redis
if sudo docker compose -f infra/docker/docker-compose.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is healthy"
else
    echo "⚠️  Redis health check failed, but service may still be starting..."
fi

# Check Prometheus
if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo "✅ Prometheus is healthy"
else
    echo "⚠️  Prometheus health check failed, but service may still be starting..."
fi

# Check Grafana
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Grafana is healthy"
else
    echo "⚠️  Grafana health check failed, but service may still be starting..."
fi

echo ""
echo "🎉 Pivotal Flow development stack is starting!"
echo ""
echo "📊 Services:"
echo "  • PostgreSQL: localhost:5433 (pivotal/pivotal)"
echo "  • Redis: localhost:6379"
echo "  • Prometheus: http://localhost:9090"
echo "  • Grafana: http://localhost:3001 (admin/admin)"
echo ""
echo "🔧 Useful commands:"
echo "  • View logs: ./scripts/docker/logs.sh"
echo "  • Stop services: ./scripts/docker/down.sh"
echo "  • Start backend: ./scripts/docker/start-backend.sh"
echo "  • Connect to PostgreSQL: ./scripts/db/psql.sh"
echo "  • Connect to Redis: ./scripts/redis/cli.sh"
echo ""
echo "⏳ Services may take a few minutes to fully start up..."
echo ""
echo "💡 To start the backend application, run: ./scripts/docker/start-backend.sh"
