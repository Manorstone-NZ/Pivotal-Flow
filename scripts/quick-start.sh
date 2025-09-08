#!/bin/bash

# Pivotal Flow Quick Start Script
# This script quickly starts all services without extensive checks
# Use this when you know everything is already set up

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Quick Starting Pivotal Flow...${NC}"

# Set environment variables
export DATABASE_URL="postgresql://pivotal:pivotal@localhost:5433/pivotal_e2e"
export REDIS_URL="redis://localhost:6379"
export JWT_SECRET="your-super-secret-jwt-key-that-is-at-least-32-characters-long"
export CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
export OPENAPI_ENABLE="true"
export NODE_ENV="development"

# Start Docker (if not running)
echo "Starting Docker services..."
cd infra/docker && docker-compose up -d && cd ../..

# Wait for Docker services
sleep 5

# Setup database (quick push and seed)
echo "Setting up database..."
DATABASE_URL="$DATABASE_URL" ALLOW_LOCAL_DB_CREATION=yes pnpm --filter backend drizzle:push || echo "Schema push failed (may already exist)"
DATABASE_URL="$DATABASE_URL" pnpm --filter backend db:seed || echo "Seeding failed (may already exist)"

# Kill existing processes
echo "Cleaning up existing processes..."
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

# Create logs directory
mkdir -p logs

# Start backend
echo "Starting backend..."
cd apps/backend
nohup pnpm dev > ../../logs/backend.log 2>&1 &
echo $! > ../../logs/backend.pid
cd ../..

# Start frontend
echo "Starting frontend..."
cd apps/frontend
nohup pnpm dev > ../../logs/frontend.log 2>&1 &
echo $! > ../../logs/frontend.pid
cd ../..

# Wait a moment
sleep 5

echo -e "${GREEN}✅ All services started!${NC}"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3000"
echo "Login: admin@pivotalflow.com / password123!extra"
