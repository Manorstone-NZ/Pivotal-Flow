#!/bin/bash

# Quick Start Script for Pivotal Flow
# Starts all services for development

set -e

echo "🚀 Pivotal Flow Quick Start"
echo "============================"

# Check if we're in the right directory
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Start Docker services
echo "🐳 Starting Docker services..."
cd infra/docker
docker compose up -d
cd ../..

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if ! docker compose ps | grep -q "Up"; then
    echo "❌ Docker services failed to start"
    docker compose logs
    exit 1
fi

echo "✅ Docker services started"

# Start backend
echo "🔧 Starting backend..."
cd apps/backend
nohup pnpm dev > /tmp/backend.out 2>&1 < /dev/null &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 15

# Test backend health
if curl -s http://localhost:3000/health | jq -e '.status == "ok"' > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    echo "Backend logs:"
    tail -n 20 /tmp/backend.out
    exit 1
fi

cd ../..

echo ""
echo "🎉 Pivotal Flow is ready!"
echo ""
echo "📋 Services:"
echo "- Backend: http://localhost:3000"
echo "- API Docs: http://localhost:3000/docs"
echo "- Health: http://localhost:3000/health"
echo "- Metrics: http://localhost:3000/metrics"
echo ""
echo "🧪 Test the API:"
echo "curl -s http://localhost:3000/health | jq"
echo ""
echo "📚 View logs:"
echo "- Backend: tail -f /tmp/backend.out"
echo "- Docker: docker compose logs -f"
echo ""
echo "🛑 To stop:"
echo "- Backend: kill $BACKEND_PID"
echo "- Docker: docker compose down"
echo ""
echo "✅ Happy developing!"
