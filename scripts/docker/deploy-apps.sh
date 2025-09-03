t#!/bin/bash

# Main Deployment Script for Pivotal Flow Applications
# This script builds and deploys backend and frontend containers

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
BUILD_FRONTEND="${BUILD_FRONTEND:-true}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
HEALTH_CHECK_TIMEOUT=60

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running or accessible"
        exit 1
    fi
    
    # Check if docker-compose is available
    if ! command -v docker compose >/dev/null 2>&1; then
        print_error "docker compose is not available"
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        print_error ".env file not found in project root"
        exit 1
    fi
    
    # Check if infrastructure is running
    cd "$PROJECT_ROOT/infra/docker"
    if ! docker compose ps | grep -q "postgres.*Up"; then
        print_warning "PostgreSQL container is not running"
        print_status "Starting infrastructure..."
        docker compose up -d
        sleep 10
    fi
    
    print_success "Prerequisites check passed"
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    
    cd "$PROJECT_ROOT/infra/docker"
    
    # Build backend
    print_status "Building backend image..."
    docker compose -f docker-compose.yml -f docker-compose.app.yml build backend
    
    # Build frontend if requested
    if [ "$BUILD_FRONTEND" = "true" ]; then
        print_status "Building frontend image..."
        docker compose -f docker-compose.yml -f docker-compose.app.yml build frontend
    else
        print_warning "Skipping frontend build"
    fi
    
    print_success "Docker images built successfully"
}

# Function to run migrations
run_migrations() {
    if [ "$RUN_MIGRATIONS" != "true" ]; then
        print_warning "Skipping migrations"
        return 0
    fi
    
    print_status "Running database migrations..."
    
    cd "$PROJECT_ROOT/infra/docker"
    
    # Run migrations using the migrate service
    ALLOW_LOCAL_DB_CREATION=yes docker compose -f docker-compose.yml -f docker-compose.app.yml --profile local_db up migrate
    
    # Check migration status
    if [ $? -eq 0 ]; then
        print_success "Migrations completed successfully"
    else
        print_error "Migrations failed"
        exit 1
    fi
}

# Function to start services
start_services() {
    print_status "Starting application services..."
    
    cd "$PROJECT_ROOT/infra/docker"
    
    # Start backend and frontend
    ALLOW_LOCAL_DB_CREATION=yes docker compose -f docker-compose.yml -f docker-compose.app.yml --profile local_db up -d backend
    
    if [ "$BUILD_FRONTEND" = "true" ]; then
        ALLOW_LOCAL_DB_CREATION=yes docker compose -f docker-compose.yml -f docker-compose.app.yml --profile local_db up -d frontend
    fi
    
    print_success "Services started"
}

# Function to wait for health
wait_for_health() {
    print_status "Waiting for services to be healthy..."
    
    local retry=0
    local max_retries=$((HEALTH_CHECK_TIMEOUT / 5))
    
    while [ $retry -lt $max_retries ]; do
        if curl -fsS http://localhost:3000/health >/dev/null 2>&1; then
            print_success "Backend is healthy"
            return 0
        fi
        
        print_status "Waiting for backend to be healthy... (attempt $((retry + 1))/$max_retries)"
        sleep 5
        retry=$((retry + 1))
    done
    
    print_error "Backend failed to become healthy within timeout"
    return 1
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Check backend health
    print_status "Checking backend health..."
    if curl -fsS http://localhost:3000/health >/dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Check metrics endpoint
    print_status "Checking metrics endpoint..."
    if curl -fsS http://localhost:3000/metrics >/dev/null 2>&1; then
        print_success "Metrics endpoint check passed"
    else
        print_error "Metrics endpoint check failed"
        return 1
    fi
    
    # Check frontend if enabled
    if [ "$BUILD_FRONTEND" = "true" ]; then
        print_status "Checking frontend..."
        if curl -fsS http://localhost:8080 >/dev/null 2>&1; then
            print_success "Frontend check passed"
        else
            print_warning "Frontend check failed (may still be starting)"
        fi
    fi
    
    print_success "Health checks completed"
}

# Function to show service status
show_status() {
    print_status "Service status:"
    
    cd "$PROJECT_ROOT/infra/docker"
    ALLOW_LOCAL_DB_CREATION=yes docker compose -f docker-compose.yml -f docker-compose.app.yml --profile local_db ps
    
    echo ""
    print_status "Service URLs:"
    echo "  Backend API:     http://localhost:3000"
    echo "  Backend Health:  http://localhost:3000/health"
    echo "  Backend Metrics: http://localhost:3000/metrics"
    echo "  Backend Docs:    http://localhost:3000/docs"
    
    if [ "$BUILD_FRONTEND" = "true" ]; then
        echo "  Frontend:       http://localhost:8080"
    fi
    
    echo "  Grafana:         http://localhost:3001 (admin/admin)"
    echo "  Prometheus:      http://localhost:9090"
    echo "  PostgreSQL:      localhost:5433"
    echo "  Redis:           localhost:6379"
}

# Function to cleanup on error
cleanup() {
    print_error "Deployment failed, cleaning up..."
    cd "$PROJECT_ROOT/infra/docker"
    docker compose -f docker-compose.yml -f docker-compose.app.yml down
    exit 1
}

# Set trap for cleanup
trap cleanup ERR

# Main execution
main() {
    echo "🚀 Pivotal Flow Application Deployment"
    echo "======================================"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Build images
    build_images
    
    # Run migrations
    run_migrations
    
    # Start services
    start_services
    
    # Wait for health
    wait_for_health
    
    # Run health checks
    run_health_checks
    
    # Show final status
    show_status
    
    echo ""
    print_success "Deployment completed successfully! 🎉"
}

# Run main function
main "$@"
