#!/bin/bash

# Pivotal Flow Development Startup Script
# This script starts all required services for development

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local service_name=$2
    
    if port_in_use $port; then
        print_warning "Port $port is already in use. Killing existing processes..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Main startup function
main() {
    print_status "Starting Pivotal Flow Development Environment"
    echo "=================================================="
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command_exists pnpm; then
        print_error "pnpm is not installed. Please install pnpm first."
        exit 1
    fi
    
    if ! command_exists curl; then
        print_error "curl is not installed. Please install curl first."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
    
    # Set environment variables
    export DATABASE_URL="postgresql://pivotal:pivotal@localhost:5433/pivotal"
    export REDIS_URL="redis://localhost:6379"
    export JWT_SECRET="your-super-secret-jwt-key-that-is-at-least-32-characters-long"
    export CORS_ORIGIN="http://localhost:3000,http://localhost:5173,http://localhost:5174"
    export OPENAPI_ENABLE="true"
    export ALLOW_LOCAL_DB_CREATION="yes"
    
    print_status "Environment variables set"
    
    # Start Docker containers
    print_status "Starting Docker containers..."
    cd infra/docker
    docker-compose up -d
    
    # Wait for Docker services to be ready
    print_status "Waiting for Docker services to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    if ! docker exec docker-postgres-1 pg_isready -U pivotal >/dev/null 2>&1; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    
    # Check if Redis is ready
    if ! docker exec docker-redis-1 redis-cli ping >/dev/null 2>&1; then
        print_error "Redis failed to start"
        exit 1
    fi
    
    print_success "Docker containers are running"
    
    # Go back to project root
    cd ../..
    
    # Kill any existing processes on required ports
    kill_port 3000 "Backend"
    kill_port 5173 "Frontend"
    
    # Start backend
    print_status "Starting backend server..."
    cd apps/backend
    
    # Start backend in background
    nohup pnpm dev > ../../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../../logs/backend.pid
    
    cd ../..
    
    # Wait for backend to be ready
    if wait_for_service "http://localhost:3000/api/v1/health" "Backend"; then
        print_success "Backend server started successfully"
    else
        print_error "Backend server failed to start"
        exit 1
    fi
    
    # Start frontend
    print_status "Starting frontend server..."
    cd apps/frontend
    
    # Start frontend in background
    nohup pnpm dev > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../../logs/frontend.pid
    
    cd ../..
    
    # Wait for frontend to be ready
    if wait_for_service "http://localhost:5173" "Frontend"; then
        print_success "Frontend server started successfully"
    else
        print_error "Frontend server failed to start"
        exit 1
    fi
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    # Display final status
    echo ""
    print_success "All services are now running!"
    echo "=================================================="
    echo "🌐 Frontend: http://localhost:5173"
    echo "🔧 Backend:  http://localhost:3000"
    echo "📊 Health:   http://localhost:3000/api/v1/health"
    echo ""
    echo "🔑 Login Credentials:"
    echo "   Email:    admin@pivotalflow.com"
    echo "   Password: password123!extra"
    echo ""
    echo "📝 Logs:"
    echo "   Backend:  tail -f logs/backend.log"
    echo "   Frontend: tail -f logs/frontend.log"
    echo ""
    echo "🛑 To stop all services:"
    echo "   ./scripts/dev-stop.sh"
    echo ""
    
    # Test login
    print_status "Testing login functionality..."
    sleep 5
    
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@pivotalflow.com","password":"password123!extra"}')
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
        print_success "Login test passed!"
    else
        print_warning "Login test failed. Check backend logs for details."
        echo "Response: $LOGIN_RESPONSE"
    fi
    
    print_success "Pivotal Flow development environment is ready!"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    # Kill background processes
    if [ -f logs/backend.pid ]; then
        kill $(cat logs/backend.pid) 2>/dev/null || true
        rm -f logs/backend.pid
    fi
    
    if [ -f logs/frontend.pid ]; then
        kill $(cat logs/frontend.pid) 2>/dev/null || true
        rm -f logs/frontend.pid
    fi
}

# Trap signals for cleanup
trap cleanup EXIT INT TERM

# Run main function
main "$@"
