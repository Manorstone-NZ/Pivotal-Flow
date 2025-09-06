#!/bin/bash

# Production Docker Setup Validation Script
# Tests the complete production stack

set -e

echo "🚀 Testing Pivotal Flow Production Docker Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Docker is running
echo "📋 Checking prerequisites..."
docker --version > /dev/null 2>&1
print_status "Docker is installed and running" $?

docker compose version > /dev/null 2>&1
print_status "Docker Compose is available" $?

# Check if production compose file exists
if [ ! -f "infra/docker/docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ Production compose file not found${NC}"
    exit 1
fi
print_status "Production compose file exists" 0

# Build images
echo ""
echo "🔨 Building production images..."
cd infra/docker

echo "Building backend image..."
docker compose -f docker-compose.prod.yml build backend
print_status "Backend image built successfully" $?

echo "Building frontend image..."
docker compose -f docker-compose.prod.yml build frontend
print_status "Frontend image built successfully" $?

# Start infrastructure services
echo ""
echo "🏗️  Starting infrastructure services..."
docker compose -f docker-compose.prod.yml up -d postgres redis prometheus grafana
print_status "Infrastructure services started" $?

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check PostgreSQL
echo "Checking PostgreSQL..."
docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U pivotal -d pivotal > /dev/null 2>&1
print_status "PostgreSQL is healthy" $?

# Check Redis
echo "Checking Redis..."
docker compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null 2>&1
print_status "Redis is healthy" $?

# Check Prometheus
echo "Checking Prometheus..."
curl -f http://localhost:9090/-/healthy > /dev/null 2>&1
print_status "Prometheus is healthy" $?

# Check Grafana
echo "Checking Grafana..."
curl -f http://localhost:3000/api/health > /dev/null 2>&1
print_status "Grafana is healthy" $?

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
docker compose -f docker-compose.prod.yml run --rm migrate
print_status "Database migrations completed" $?

# Start application services
echo ""
echo "🚀 Starting application services..."
docker compose -f docker-compose.prod.yml up -d backend frontend
print_status "Application services started" $?

# Wait for application services
echo ""
echo "⏳ Waiting for application services to be healthy..."
sleep 60

# Check Backend
echo "Checking Backend API..."
curl -f http://localhost:3000/health > /dev/null 2>&1
print_status "Backend API is healthy" $?

# Check Frontend
echo "Checking Frontend..."
curl -f http://localhost:8080/health > /dev/null 2>&1
print_status "Frontend is healthy" $?

# Test API endpoints
echo ""
echo "🧪 Testing API endpoints..."

# Test health endpoint
curl -f http://localhost:3000/health > /dev/null 2>&1
print_status "Health endpoint responds" $?

# Test metrics endpoint
curl -f http://localhost:3000/metrics > /dev/null 2>&1
print_status "Metrics endpoint responds" $?

# Test OpenAPI endpoint
curl -f http://localhost:3000/api/openapi.json > /dev/null 2>&1
print_status "OpenAPI endpoint responds" $?

# Check Prometheus scraping
echo ""
echo "📊 Checking Prometheus scraping..."
sleep 30
curl -s http://localhost:9090/api/v1/targets | grep -q '"health":"up"'
print_status "Prometheus is scraping targets" $?

# Display service status
echo ""
echo "📋 Service Status:"
echo "=================="
docker compose -f docker-compose.prod.yml ps

# Display resource usage
echo ""
echo "💾 Resource Usage:"
echo "=================="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# Display URLs
echo ""
echo "🌐 Service URLs:"
echo "==============="
echo "Frontend: http://localhost:8080"
echo "Backend API: http://localhost:3000"
echo "API Health: http://localhost:3000/health"
echo "API Metrics: http://localhost:3000/metrics"
echo "OpenAPI Docs: http://localhost:3000/api/openapi.json"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3000 (admin/admin)"

echo ""
echo "🎉 Production setup validation completed!"
echo ""
echo "To stop all services:"
echo "docker compose -f docker-compose.prod.yml down"
echo ""
echo "To stop and remove volumes:"
echo "docker compose -f docker-compose.prod.yml down -v"
