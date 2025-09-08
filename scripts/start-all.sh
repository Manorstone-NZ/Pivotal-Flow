#!/bin/bash

# Pivotal Flow Complete Startup Script
# This script starts all systems in the correct logical order:
# 1. Docker services (PostgreSQL, Redis)
# 2. Database setup (push schema, seed data)
# 3. Backend server
# 4. Frontend server
# 5. Health checks and validation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

print_header() {
    echo -e "${CYAN}==================================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}==================================================${NC}"
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
        if curl -s --connect-timeout 5 "$url" >/dev/null 2>&1; then
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

# Function to check prerequisites
check_prerequisites() {
    print_header "CHECKING PREREQUISITES"
    
    local missing_deps=()
    
    if ! command_exists docker; then
        missing_deps+=("docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("docker-compose")
    fi
    
    if ! command_exists pnpm; then
        missing_deps+=("pnpm")
    fi
    
    if ! command_exists curl; then
        missing_deps+=("curl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to set environment variables
setup_environment() {
    print_header "SETTING UP ENVIRONMENT"
    
    export DATABASE_URL="postgresql://pivotal:pivotal@localhost:5433/pivotal_e2e"
    export REDIS_URL="redis://localhost:6379"
    export JWT_SECRET="your-super-secret-jwt-key-that-is-at-least-32-characters-long"
    export CORS_ORIGIN="http://localhost:3000,http://localhost:5173,http://localhost:5174"
    export OPENAPI_ENABLE="true"
    export ALLOW_LOCAL_DB_CREATION="yes"
    export NODE_ENV="development"
    export PORT="3000"
    export HOST="localhost"
    
    print_success "Environment variables configured"
}

# Function to start Docker services
start_docker_services() {
    print_header "STARTING DOCKER SERVICES"
    
    print_step "Starting PostgreSQL and Redis containers..."
    cd infra/docker
    docker-compose up -d
    cd ../..
    
    print_status "Waiting for Docker services to initialize..."
    sleep 10
    
    # Check PostgreSQL
    print_status "Checking PostgreSQL connection..."
    if docker exec docker_postgres_1 pg_isready -U pivotal -d pivotal_e2e >/dev/null 2>&1; then
        print_success "PostgreSQL is ready"
    else
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    
    # Check Redis
    print_status "Checking Redis connection..."
    if docker exec docker_redis_1 redis-cli ping >/dev/null 2>&1; then
        print_success "Redis is ready"
    else
        print_error "Redis failed to start"
        exit 1
    fi
    
    print_success "Docker services are running"
}

# Function to setup database
setup_database() {
    print_header "SETTING UP DATABASE"
    
    print_step "Generating database schema..."
    if pnpm --filter backend drizzle:generate; then
        print_success "Database schema generated"
    else
        print_error "Failed to generate database schema"
        exit 1
    fi
    
    print_step "Pushing database schema..."
    if DATABASE_URL="$DATABASE_URL" ALLOW_LOCAL_DB_CREATION=yes pnpm --filter backend drizzle:push; then
        print_success "Database schema pushed successfully"
    else
        print_warning "Database schema push failed - this may be normal if schema already exists"
        print_status "Continuing with seeding..."
    fi
    
    print_step "Seeding database with demo data..."
    if DATABASE_URL="$DATABASE_URL" pnpm --filter backend db:seed; then
        print_success "Database seeded successfully"
    else
        print_error "Failed to seed database"
        exit 1
    fi
}

# Function to start backend
start_backend() {
    print_header "STARTING BACKEND SERVER"
    
    # Kill any existing backend processes
    kill_port 3000 "Backend"
    
    print_step "Starting backend server..."
    cd apps/backend
    
    # Start backend in background
    nohup pnpm dev > ../../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../../logs/backend.pid
    
    cd ../..
    
    # Wait for backend to be ready
    if wait_for_service "http://localhost:3000/api/v1/health" "Backend"; then
        print_success "Backend server started successfully (PID: $BACKEND_PID)"
    else
        print_error "Backend server failed to start"
        print_error "Check logs: tail -f logs/backend.log"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_header "STARTING FRONTEND SERVER"
    
    # Kill any existing frontend processes
    kill_port 5173 "Frontend"
    
    print_step "Starting frontend server..."
    cd apps/frontend
    
    # Start frontend in background
    nohup pnpm dev > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../../logs/frontend.pid
    
    cd ../..
    
    # Wait for frontend to be ready
    if wait_for_service "http://localhost:5173" "Frontend"; then
        print_success "Frontend server started successfully (PID: $FRONTEND_PID)"
    else
        print_error "Frontend server failed to start"
        print_error "Check logs: tail -f logs/frontend.log"
        exit 1
    fi
}

# Function to run health checks
run_health_checks() {
    print_header "RUNNING HEALTH CHECKS"
    
    print_step "Testing backend health endpoint..."
    if curl -s "http://localhost:3000/api/v1/health" | grep -q "status"; then
        print_success "Backend health check passed"
    else
        print_warning "Backend health check failed"
    fi
    
    print_step "Testing frontend accessibility..."
    if curl -s "http://localhost:5173" | grep -q "html"; then
        print_success "Frontend accessibility check passed"
    else
        print_warning "Frontend accessibility check failed"
    fi
    
    print_step "Testing login functionality..."
    sleep 3
    
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@pivotalflow.com","password":"password123!extra"}' \
        --connect-timeout 10)
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
        print_success "Login test passed!"
    else
        print_warning "Login test failed. Response: $LOGIN_RESPONSE"
    fi
}

# Function to display final status
display_final_status() {
    print_header "STARTUP COMPLETE"
    
    echo -e "${GREEN}🎉 All services are now running!${NC}"
    echo ""
    echo -e "${CYAN}📱 Application URLs:${NC}"
    echo "   🌐 Frontend: http://localhost:5173"
    echo "   🔧 Backend:  http://localhost:3000"
    echo "   📊 Health:   http://localhost:3000/api/v1/health"
    echo "   📚 API Docs: http://localhost:3000/api/docs"
    echo ""
    echo -e "${CYAN}🔑 Login Credentials:${NC}"
    echo "   Email:    admin@pivotalflow.com"
    echo "   Password: password123!extra"
    echo ""
    echo -e "${CYAN}📝 Logs:${NC}"
    echo "   Backend:  tail -f logs/backend.log"
    echo "   Frontend: tail -f logs/frontend.log"
    echo ""
    echo -e "${CYAN}🛑 To stop all services:${NC}"
    echo "   ./scripts/dev-stop.sh"
    echo ""
    echo -e "${CYAN}🔄 To restart services:${NC}"
    echo "   ./scripts/start-all.sh"
    echo ""
    echo -e "${GREEN}✨ Ready to develop! Happy coding! ✨${NC}"
}

# Function to create logs directory
create_logs_directory() {
    mkdir -p logs
    touch logs/backend.log logs/frontend.log
}

# Cleanup function
cleanup() {
    print_status "Cleaning up on exit..."
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

# Main function
main() {
    print_header "PIVOTAL FLOW DEVELOPMENT STARTUP"
    echo -e "${BLUE}Starting all systems in logical order...${NC}"
    echo ""
    
    # Create logs directory
    create_logs_directory
    
    # Run startup steps in order
    check_prerequisites
    setup_environment
    start_docker_services
    setup_database
    start_backend
    start_frontend
    run_health_checks
    display_final_status
}

# Trap signals for cleanup
trap cleanup EXIT INT TERM

# Run main function
main "$@"
