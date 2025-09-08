#!/bin/bash

# Pivotal Flow Development Stop Script
# This script stops all development services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local service_name=$2
    
    print_status "Stopping $service_name on port $port..."
    
    # Find and kill processes on the port
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill -9 2>/dev/null || true
        print_success "$service_name stopped"
    else
        print_warning "No $service_name process found on port $port"
    fi
}

# Function to stop Docker containers
stop_docker() {
    print_status "Stopping Docker containers..."
    
    cd infra/docker
    docker-compose down
    cd ../..
    
    print_success "Docker containers stopped"
}

# Main stop function
main() {
    print_status "Stopping Pivotal Flow Development Environment"
    echo "=================================================="
    
    # Stop frontend and backend
    kill_port 5173 "Frontend"
    kill_port 3000 "Backend"
    
    # Stop Docker containers
    stop_docker
    
    # Clean up PID files
    if [ -f logs/backend.pid ]; then
        rm -f logs/backend.pid
        print_status "Cleaned up backend PID file"
    fi
    
    if [ -f logs/frontend.pid ]; then
        rm -f logs/frontend.pid
        print_status "Cleaned up frontend PID file"
    fi
    
    # Clean up any remaining processes
    print_status "Cleaning up any remaining processes..."
    
    # Kill any remaining pnpm processes
    pkill -f "pnpm dev" 2>/dev/null || true
    
    # Kill any remaining tsx processes
    pkill -f "tsx watch" 2>/dev/null || true
    
    print_success "All services stopped successfully!"
    echo ""
    echo "To start services again, run:"
    echo "  ./scripts/start-all.sh"
    echo "  ./scripts/quick-start.sh"
}

# Run main function
main "$@"
