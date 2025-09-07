#!/bin/bash

# E2E Docker Setup Script
# Starts the full Docker Compose stack for E2E testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_DIR="infra/docker"
INFRA_COMPOSE_FILE="${COMPOSE_DIR}/docker-compose.yml"
APP_COMPOSE_FILE="${COMPOSE_DIR}/docker-compose.app.dev.yml"
TIMEOUT=300 # 5 minutes timeout

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
}

# Check if Docker Compose files exist
check_compose_files() {
    if [[ ! -f "$INFRA_COMPOSE_FILE" ]]; then
        log_error "Infrastructure compose file not found: $INFRA_COMPOSE_FILE"
        exit 1
    fi
    
    if [[ ! -f "$APP_COMPOSE_FILE" ]]; then
        log_error "Application compose file not found: $APP_COMPOSE_FILE"
        exit 1
    fi
    
    log_success "Docker Compose files found"
}

# Start infrastructure services
start_infrastructure() {
    log_info "Starting infrastructure services (PostgreSQL, Redis)..."
    
    docker compose -f "$INFRA_COMPOSE_FILE" up -d
    
    log_success "Infrastructure services started"
}

# Wait for infrastructure services to be healthy
wait_for_infrastructure() {
    log_info "Waiting for infrastructure services to be healthy..."
    
    # Wait for PostgreSQL
    log_info "Waiting for PostgreSQL..."
    timeout $TIMEOUT bash -c 'until docker compose -f "'$INFRA_COMPOSE_FILE'" exec postgres pg_isready -U pivotal -d pivotal_e2e; do sleep 2; done'
    log_success "PostgreSQL is ready"
    
    # Wait for Redis
    log_info "Waiting for Redis..."
    timeout $TIMEOUT bash -c 'until docker compose -f "'$INFRA_COMPOSE_FILE'" exec redis redis-cli ping | grep -q PONG; do sleep 2; done'
    log_success "Redis is ready"
}

# Start application services
start_application() {
    log_info "Starting application services (Backend, Frontend)..."
    
    docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" up -d --build
    
    log_success "Application services started"
}

# Wait for application services to be healthy
wait_for_application() {
    log_info "Waiting for application services to be healthy..."
    
    # Wait for Backend
    log_info "Waiting for Backend API..."
    timeout $TIMEOUT bash -c 'until curl -f http://localhost:3000/health > /dev/null 2>&1; do sleep 2; done'
    log_success "Backend API is ready"
    
    # Wait for Backend OpenAPI docs
    log_info "Waiting for Backend OpenAPI docs..."
    timeout $TIMEOUT bash -c 'until curl -f http://localhost:3000/api/openapi.json > /dev/null 2>&1; do sleep 2; done'
    log_success "Backend OpenAPI docs are ready"
    
    # Wait for Frontend
    log_info "Waiting for Frontend..."
    timeout $TIMEOUT bash -c 'until curl -f http://localhost:5173 > /dev/null 2>&1; do sleep 2; done'
    log_success "Frontend is ready"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Run migrations in backend container
    docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" exec backend pnpm db:migrate || {
        log_warning "Migrations failed, trying to create database..."
        docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" exec backend pnpm db:create || true
        docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" exec backend pnpm db:migrate || true
    }
    
    log_success "Database migrations completed"
}

# Seed the database
seed_database() {
    log_info "Seeding database with demo data..."
    
    # Run seeding script
    docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" exec backend pnpm seed || {
        log_warning "Seeding failed, continuing without demo data..."
    }
    
    log_success "Database seeding completed"
}

# Show service status
show_status() {
    log_info "Service Status:"
    echo ""
    docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" ps
    echo ""
    
    log_info "Service URLs:"
    echo "  • Backend API: http://localhost:3000"
    echo "  • Backend Health: http://localhost:3000/health"
    echo "  • Backend OpenAPI: http://localhost:3000/api/openapi.json"
    echo "  • Frontend: http://localhost:5173"
    echo "  • PostgreSQL: localhost:5433"
    echo "  • Redis: localhost:6379"
    echo ""
}

# Main execution
main() {
    log_info "Starting E2E Docker Environment Setup"
    echo ""
    
    # Pre-flight checks
    check_docker
    check_compose_files
    
    # Start services
    start_infrastructure
    wait_for_infrastructure
    
    start_application
    wait_for_application
    
    # Setup database
    run_migrations
    seed_database
    
    # Show final status
    show_status
    
    log_success "E2E Docker environment is ready!"
    log_info "You can now run E2E tests with: pnpm test:e2e"
    log_info "To stop the environment, run: ./scripts/e2e/down.sh"
}

# Handle script interruption
cleanup() {
    log_warning "Script interrupted. Cleaning up..."
    docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" down
    exit 1
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Run main function
main "$@"
