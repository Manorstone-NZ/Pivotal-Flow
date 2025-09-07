#!/bin/bash

# E2E Docker Cleanup Script
# Stops and cleans up the Docker Compose stack for E2E testing

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

# Stop and remove containers
stop_services() {
    log_info "Stopping E2E services..."
    
    # Stop application services first
    if docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" ps -q | grep -q .; then
        docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" down
        log_success "Application services stopped"
    else
        log_warning "No application services running"
    fi
    
    # Stop infrastructure services
    if docker compose -f "$INFRA_COMPOSE_FILE" ps -q | grep -q .; then
        docker compose -f "$INFRA_COMPOSE_FILE" down
        log_success "Infrastructure services stopped"
    else
        log_warning "No infrastructure services running"
    fi
}

# Remove volumes (optional)
remove_volumes() {
    if [[ "$1" == "--volumes" ]] || [[ "$1" == "-v" ]]; then
        log_warning "Removing volumes (this will delete all data)..."
        
        # Remove application volumes
        docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" down -v 2>/dev/null || true
        
        # Remove infrastructure volumes
        docker compose -f "$INFRA_COMPOSE_FILE" down -v 2>/dev/null || true
        
        log_success "Volumes removed"
    else
        log_info "Volumes preserved (use --volumes to remove them)"
    fi
}

# Clean up Docker resources
cleanup_docker() {
    log_info "Cleaning up Docker resources..."
    
    # Remove unused containers
    docker container prune -f > /dev/null 2>&1 || true
    
    # Remove unused images
    docker image prune -f > /dev/null 2>&1 || true
    
    # Remove unused networks
    docker network prune -f > /dev/null 2>&1 || true
    
    log_success "Docker cleanup completed"
}

# Show final status
show_status() {
    log_info "Final Status:"
    echo ""
    
    # Check if any services are still running
    if docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" ps -q | grep -q .; then
        log_warning "Some services are still running:"
        docker compose -f "$INFRA_COMPOSE_FILE" -f "$APP_COMPOSE_FILE" ps
    else
        log_success "All E2E services stopped"
    fi
    
    echo ""
}

# Main execution
main() {
    log_info "Stopping E2E Docker Environment"
    echo ""
    
    # Stop services
    stop_services
    
    # Handle volume removal
    remove_volumes "$1"
    
    # Cleanup Docker resources
    cleanup_docker
    
    # Show final status
    show_status
    
    log_success "E2E Docker environment cleanup completed!"
    log_info "To start the environment again, run: ./scripts/e2e/up.sh"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --volumes, -v    Remove volumes (deletes all data)"
    echo "  --help, -h       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0               Stop services, keep volumes"
    echo "  $0 --volumes     Stop services, remove volumes"
}

# Handle help flag
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_usage
    exit 0
fi

# Run main function
main "$@"
