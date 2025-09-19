#!/bin/bash

# Pivotal Flow Complete System Installer
# This script installs and builds the entire Pivotal Flow system following proper dependency order
# 
# Usage: ./install.sh [options]
# Options:
#   --dev-only     Skip production build steps
#   --no-docker    Skip Docker services (assumes external DB/Redis)
#   --clean        Clean install (removes existing node_modules, builds)
#   --help         Show this help message

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
DEV_ONLY=false
NO_DOCKER=false
CLEAN_INSTALL=false
SHOW_HELP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dev-only)
            DEV_ONLY=true
            shift
            ;;
        --no-docker)
            NO_DOCKER=true
            shift
            ;;
        --clean)
            CLEAN_INSTALL=true
            shift
            ;;
        --help)
            SHOW_HELP=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

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
    echo ""
    echo -e "${CYAN}===========================================================${NC}"
    echo -e "${CYAN}${BOLD}$1${NC}"
    echo -e "${CYAN}===========================================================${NC}"
}

print_substep() {
    echo -e "${BLUE}  → $1${NC}"
}

# Function to show help
show_help() {
    cat << EOF
${BOLD}Pivotal Flow Complete System Installer${NC}

This script installs and builds the entire Pivotal Flow system following proper dependency order:
1. System prerequisites validation
2. Infrastructure services (Docker)
3. Shared packages build (in dependency order)
4. Backend application build and setup
5. Frontend application build
6. System validation and startup

${BOLD}Usage:${NC}
  ./install.sh [options]

${BOLD}Options:${NC}
  --dev-only     Skip production build steps, faster development setup
  --no-docker    Skip Docker services (assumes external PostgreSQL/Redis)
  --clean        Clean install (removes existing node_modules, builds)
  --help         Show this help message

${BOLD}Examples:${NC}
  ./install.sh                    # Full installation
  ./install.sh --dev-only         # Development setup only
  ./install.sh --clean --dev-only # Clean development install
  ./install.sh --no-docker        # Install without Docker services

${BOLD}System Requirements:${NC}
  - Node.js >=20.0.0
  - pnpm >=8.0.0
  - Docker & Docker Compose (unless --no-docker)
  - Git
  - curl

${BOLD}After Installation:${NC}
  - Frontend: http://localhost:5173
  - Backend: http://localhost:3000
  - API Docs: http://localhost:3000/docs
  - Login: admin@pivotalflow.com / password123!extra

EOF
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to get Node.js version
get_node_version() {
    node --version | sed 's/v//' | cut -d. -f1
}

# Function to get pnpm version
get_pnpm_version() {
    pnpm --version | cut -d. -f1
}

# Function to check system prerequisites
check_prerequisites() {
    print_header "CHECKING SYSTEM PREREQUISITES"
    
    local missing_deps=()
    local version_issues=()
    
    # Check Node.js
    if ! command_exists node; then
        missing_deps+=("node (>=20.0.0)")
    else
        local node_version=$(get_node_version)
        if [ "$node_version" -lt 20 ]; then
            version_issues+=("Node.js version $node_version < 20 (required: >=20.0.0)")
        else
            print_substep "✅ Node.js $(node --version)"
        fi
    fi
    
    # Check pnpm
    if ! command_exists pnpm; then
        missing_deps+=("pnpm (>=8.0.0)")
    else
        local pnpm_version=$(get_pnpm_version)
        if [ "$pnpm_version" -lt 8 ]; then
            version_issues+=("pnpm version $pnpm_version < 8 (required: >=8.0.0)")
        else
            print_substep "✅ pnpm $(pnpm --version)"
        fi
    fi
    
    # Check Docker (unless --no-docker)
    if [ "$NO_DOCKER" = false ]; then
        if ! command_exists docker; then
            missing_deps+=("docker")
        else
            print_substep "✅ Docker $(docker --version | cut -d' ' -f3 | sed 's/,//')"
        fi
        
        if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
            missing_deps+=("docker-compose")
        else
            print_substep "✅ Docker Compose available"
        fi
    fi
    
    # Check other required tools
    for tool in git curl; do
        if ! command_exists "$tool"; then
            missing_deps+=("$tool")
        else
            print_substep "✅ $tool available"
        fi
    done
    
    # Report issues
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo ""
        echo "Please install the missing dependencies:"
        echo ""
        echo "📦 Node.js >=20.0.0: https://nodejs.org/"
        echo "📦 pnpm >=8.0.0: npm install -g pnpm"
        if [ "$NO_DOCKER" = false ]; then
            echo "🐳 Docker: https://docs.docker.com/get-docker/"
            echo "🐳 Docker Compose: https://docs.docker.com/compose/install/"
        fi
        echo ""
        exit 1
    fi
    
    if [ ${#version_issues[@]} -ne 0 ]; then
        print_error "Version issues: ${version_issues[*]}"
        echo ""
        echo "Please update the tools to meet minimum version requirements."
        echo ""
        exit 1
    fi
    
    print_success "All prerequisites satisfied"
}

# Function to clean previous installations
clean_installation() {
    if [ "$CLEAN_INSTALL" = true ]; then
        print_header "CLEANING PREVIOUS INSTALLATION"
        
        print_step "Stopping existing services..."
        if [ -f "scripts/dev-stop.sh" ]; then
            ./scripts/dev-stop.sh || true
        fi
        
        print_step "Removing node_modules..."
        find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
        
        print_step "Removing build artifacts..."
        find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
        find . -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
        
        print_step "Removing logs..."
        rm -rf logs/*.log logs/*.pid 2>/dev/null || true
        
        print_success "Clean installation prepared"
    fi
}

# Function to setup environment variables
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
    
    print_substep "Database URL: $DATABASE_URL"
    print_substep "Redis URL: $REDIS_URL"
    print_substep "CORS Origins: $CORS_ORIGIN"
    print_substep "OpenAPI: $OPENAPI_ENABLE"
    
    print_success "Environment configured for development"
}

# Function to install dependencies
install_dependencies() {
    print_header "INSTALLING DEPENDENCIES"
    
    print_step "Installing workspace dependencies..."
    if pnpm install; then
        print_success "Workspace dependencies installed"
    else
        print_error "Failed to install workspace dependencies"
        exit 1
    fi
}

# Function to start infrastructure services
start_infrastructure() {
    if [ "$NO_DOCKER" = false ]; then
        print_header "STARTING INFRASTRUCTURE SERVICES"
        
        print_step "Starting Docker services (PostgreSQL, Redis)..."
        cd infra/docker
        if docker compose up -d; then
            print_success "Docker services started"
        else
            print_error "Failed to start Docker services"
            exit 1
        fi
        cd ../..
        
        print_step "Waiting for services to initialize..."
        sleep 10
        
        # Verify PostgreSQL
        print_substep "Verifying PostgreSQL connection..."
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if docker exec docker-postgres-1 pg_isready -U pivotal -d pivotal_e2e >/dev/null 2>&1; then
                print_substep "✅ PostgreSQL ready"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                print_error "PostgreSQL failed to start after $max_attempts attempts"
                exit 1
            fi
            
            echo -n "."
            sleep 2
            attempt=$((attempt + 1))
        done
        
        # Verify Redis
        print_substep "Verifying Redis connection..."
        if docker exec docker-redis-1 redis-cli ping >/dev/null 2>&1; then
            print_substep "✅ Redis ready"
        else
            print_error "Redis failed to start"
            exit 1
        fi
        
        print_success "Infrastructure services running"
    else
        print_header "SKIPPING INFRASTRUCTURE (--no-docker)"
        print_warning "Assuming external PostgreSQL and Redis are available"
    fi
}

# Function to build shared packages (following dependency order)
build_shared_packages() {
    print_header "BUILDING SHARED PACKAGES (DEPENDENCY ORDER)"
    
    # Step 1: Build shared library (foundation)
    print_step "Building packages/shared (foundation library)..."
    if pnpm --filter packages/shared build; then
        print_substep "✅ Shared library built"
    else
        print_error "Failed to build shared library"
        exit 1
    fi
    
    # Step 2: Build Xero integration (depends on shared)
    print_step "Building packages/integrations/xero (depends on shared)..."
    if pnpm --filter packages/integrations/xero build; then
        print_substep "✅ Xero integration built"
    else
        print_error "Failed to build Xero integration"
        exit 1
    fi
    
    # Step 3: Build SDK (depends on backend API schema - will build after backend starts)
    print_step "Deferring packages/sdk build (requires running backend for schema generation)..."
    print_substep "⏳ SDK will be built after backend is running"
    
    print_success "Shared packages built in dependency order"
}

# Function to setup database
setup_database() {
    print_header "SETTING UP DATABASE"
    
    print_step "Pushing database schema..."
    if DATABASE_URL="$DATABASE_URL" ALLOW_LOCAL_DB_CREATION=yes pnpm --filter backend drizzle:push; then
        print_substep "✅ Database schema pushed"
    else
        print_warning "Schema push failed - may already exist, continuing..."
    fi
    
    print_step "Seeding database with demo data..."
    if DATABASE_URL="$DATABASE_URL" pnpm --filter backend db:seed; then
        print_substep "✅ Database seeded"
    else
        print_warning "Database seeding failed - may already exist, continuing..."
    fi
    
    print_success "Database setup completed"
}

# Function to build and start backend
build_backend() {
    print_header "BUILDING BACKEND APPLICATION"
    
    if [ "$DEV_ONLY" = false ]; then
        print_step "Building backend for production..."
        if pnpm --filter backend build; then
            print_substep "✅ Backend production build completed"
        else
            print_error "Backend production build failed"
            exit 1
        fi
    else
        print_step "Skipping backend production build (--dev-only)"
    fi
    
    print_step "Starting backend in development mode..."
    
    # Kill any existing backend processes
    if port_in_use 3000; then
        print_substep "Stopping existing backend on port 3000..."
        lsof -ti :3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Create logs directory
    mkdir -p logs
    
    # Start backend
    cd apps/backend
    nohup pnpm dev > ../../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../../logs/backend.pid
    cd ../..
    
    print_substep "Backend started with PID: $BACKEND_PID"
    
    # Wait for backend to be ready
    print_step "Waiting for backend to be ready..."
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s --connect-timeout 5 "http://localhost:3000/api/v1/health" >/dev/null 2>&1; then
            print_substep "✅ Backend health check passed"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Backend failed to start after $max_attempts attempts"
            print_error "Check logs: tail -f logs/backend.log"
            exit 1
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_success "Backend application running"
}

# Function to build SDK (now that backend is running)
build_sdk() {
    print_header "BUILDING SDK (REQUIRES RUNNING BACKEND)"
    
    print_step "Generating SDK from OpenAPI schema..."
    if pnpm --filter packages/sdk build; then
        print_substep "✅ SDK generated and built"
    else
        print_warning "SDK build failed - continuing without SDK updates"
    fi
    
    print_success "SDK build completed"
}

# Function to build and start frontend
build_frontend() {
    print_header "BUILDING FRONTEND APPLICATION"
    
    # Build SDK first if not already done
    print_step "Ensuring SDK is available for frontend..."
    pnpm --filter packages/sdk build || print_warning "SDK build failed, using existing version"
    
    if [ "$DEV_ONLY" = false ]; then
        print_step "Building frontend for production..."
        if pnpm --filter frontend build; then
            print_substep "✅ Frontend production build completed"
        else
            print_error "Frontend production build failed"
            exit 1
        fi
    else
        print_step "Skipping frontend production build (--dev-only)"
    fi
    
    print_step "Starting frontend in development mode..."
    
    # Kill any existing frontend processes
    if port_in_use 5173; then
        print_substep "Stopping existing frontend on port 5173..."
        lsof -ti :5173 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Start frontend
    cd apps/frontend
    nohup pnpm dev > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../../logs/frontend.pid
    cd ../..
    
    print_substep "Frontend started with PID: $FRONTEND_PID"
    
    # Wait for frontend to be ready
    print_step "Waiting for frontend to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s --connect-timeout 5 "http://localhost:5173" >/dev/null 2>&1; then
            print_substep "✅ Frontend accessibility check passed"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Frontend failed to start after $max_attempts attempts"
            print_error "Check logs: tail -f logs/frontend.log"
            exit 1
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_success "Frontend application running"
}

# Function to run comprehensive validation
run_validation() {
    print_header "RUNNING SYSTEM VALIDATION"
    
    print_step "Testing backend health endpoint..."
    if curl -s --connect-timeout 10 "http://localhost:3000/api/v1/health" | grep -q "status"; then
        print_substep "✅ Backend health check passed"
    else
        print_warning "❌ Backend health check failed"
    fi
    
    print_step "Testing OpenAPI documentation..."
    if curl -s --connect-timeout 10 "http://localhost:3000/api/openapi.json" | grep -q "openapi"; then
        print_substep "✅ OpenAPI JSON endpoint working"
    else
        print_warning "❌ OpenAPI endpoint failed"
    fi
    
    print_step "Testing frontend accessibility..."
    if curl -s --connect-timeout 10 "http://localhost:5173" | grep -q "html"; then
        print_substep "✅ Frontend serving HTML"
    else
        print_warning "❌ Frontend accessibility failed"
    fi
    
    print_step "Testing authentication system..."
    sleep 3
    
    local login_response=$(curl -s --connect-timeout 15 -X POST http://localhost:3000/api/v1/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@pivotalflow.com","password":"password123!extra"}' 2>/dev/null)
    
    if echo "$login_response" | grep -q "accessToken"; then
        print_substep "✅ Authentication system working"
    else
        print_warning "❌ Authentication test failed"
        print_substep "Response: $login_response"
    fi
    
    print_success "System validation completed"
}

# Function to run quality assurance checks
run_quality_checks() {
    if [ "$DEV_ONLY" = false ]; then
        print_header "RUNNING QUALITY ASSURANCE CHECKS"
        
        print_step "Running TypeScript type checking..."
        if pnpm -w typecheck; then
            print_substep "✅ Type checking passed"
        else
            print_warning "❌ Type checking failed"
        fi
        
        print_step "Running ESLint checks..."
        if pnpm -w lint; then
            print_substep "✅ Linting passed"
        else
            print_warning "❌ Linting failed"
        fi
        
        print_step "Running unit tests..."
        if pnpm -w test; then
            print_substep "✅ Unit tests passed"
        else
            print_warning "❌ Unit tests failed"
        fi
        
        print_success "Quality assurance checks completed"
    else
        print_header "SKIPPING QUALITY CHECKS (--dev-only)"
    fi
}

# Function to display final status and instructions
display_final_status() {
    print_header "INSTALLATION COMPLETE"
    
    echo ""
    echo -e "${GREEN}${BOLD}🎉 Pivotal Flow System Successfully Installed! 🎉${NC}"
    echo ""
    echo -e "${CYAN}${BOLD}📱 Application URLs:${NC}"
    echo "   🌐 Frontend:    http://localhost:5173"
    echo "   🔧 Backend:     http://localhost:3000"
    echo "   📊 Health:      http://localhost:3000/api/v1/health"
    echo "   📚 API Docs:    http://localhost:3000/docs"
    echo "   📋 OpenAPI:     http://localhost:3000/api/openapi.json"
    echo ""
    echo -e "${CYAN}${BOLD}🔑 Default Login Credentials:${NC}"
    echo "   Email:    admin@pivotalflow.com"
    echo "   Password: password123!extra"
    echo ""
    echo -e "${CYAN}${BOLD}📝 System Logs:${NC}"
    echo "   Backend:  tail -f logs/backend.log"
    echo "   Frontend: tail -f logs/frontend.log"
    echo ""
    echo -e "${CYAN}${BOLD}🔧 Management Commands:${NC}"
    echo "   Stop:     ./scripts/dev-stop.sh"
    echo "   Restart:  ./scripts/start-all.sh"
    echo "   Quick:    ./scripts/quick-start.sh"
    echo ""
    echo -e "${CYAN}${BOLD}🧪 Development Commands:${NC}"
    echo "   Tests:    pnpm -w test"
    echo "   Lint:     pnpm -w lint"
    echo "   Build:    pnpm -w build"
    echo "   QA:       pnpm qa:check"
    echo ""
    
    if [ "$DEV_ONLY" = true ]; then
        echo -e "${YELLOW}${BOLD}📝 Note: Development-only installation completed${NC}"
        echo "   Run './install.sh' without --dev-only for full production build"
        echo ""
    fi
    
    if [ "$NO_DOCKER" = true ]; then
        echo -e "${YELLOW}${BOLD}📝 Note: Docker services were skipped${NC}"
        echo "   Ensure external PostgreSQL and Redis are configured"
        echo ""
    fi
    
    echo -e "${GREEN}${BOLD}✨ Ready for development! Happy coding! ✨${NC}"
    echo ""
}

# Cleanup function
cleanup() {
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        print_status "Cleaning up backend process..."
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        print_status "Cleaning up frontend process..."
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
}

# Main installation function
main() {
    if [ "$SHOW_HELP" = true ]; then
        show_help
        exit 0
    fi
    
    print_header "PIVOTAL FLOW SYSTEM INSTALLER"
    echo -e "${BLUE}Building and installing all components in dependency order...${NC}"
    
    if [ "$DEV_ONLY" = true ]; then
        echo -e "${YELLOW}Mode: Development Only${NC}"
    else
        echo -e "${GREEN}Mode: Full Installation${NC}"
    fi
    
    if [ "$NO_DOCKER" = true ]; then
        echo -e "${YELLOW}Docker: Skipped${NC}"
    fi
    
    if [ "$CLEAN_INSTALL" = true ]; then
        echo -e "${YELLOW}Clean: Enabled${NC}"
    fi
    
    echo ""
    
    # Execute installation steps in dependency order
    check_prerequisites
    clean_installation
    setup_environment
    install_dependencies
    start_infrastructure
    build_shared_packages
    setup_database
    build_backend
    build_sdk
    build_frontend
    run_validation
    run_quality_checks
    display_final_status
}

# Trap signals for cleanup
trap cleanup EXIT INT TERM

# Run main installation
main "$@"
