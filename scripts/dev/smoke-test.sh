#!/bin/bash

# C2 Seed and Fixtures - Smoke Test Script
# Runs seed and fixtures scripts, then performs basic curl checks

set -e

echo "🚀 Starting C2 Seed and Fixtures Smoke Test..."

# Load environment variables
source .env 2>/dev/null || true

# API base URL
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Check if backend is running
check_backend() {
    log_info "Checking if backend is running..."
    if ! curl -s "$API_BASE_URL/health" >/dev/null 2>&1; then
        log_error "Backend is not running at $API_BASE_URL"
        log_info "Please start the backend with: ./scripts/docker/start.sh"
        exit 1
    fi
    log_success "Backend is running"
}

# Run seed script
run_seed() {
    log_info "Running seed script..."
    if ! ./scripts/dev/seed.sh; then
        log_error "Seed script failed"
        exit 1
    fi
    log_success "Seed script completed"
}

# Run fixtures script
run_fixtures() {
    log_info "Running fixtures script..."
    if ! ./scripts/dev/fixtures.sh; then
        log_error "Fixtures script failed"
        exit 1
    fi
    log_success "Fixtures script completed"
}

# Test health endpoint
test_health() {
    log_info "Testing health endpoint..."
    response=$(curl -s "$API_BASE_URL/health")
    if echo "$response" | grep -q '"status":"ok"'; then
        log_success "Health endpoint working"
    else
        log_error "Health endpoint failed: $response"
        return 1
    fi
}

# Test quotes endpoint
test_quotes() {
    log_info "Testing quotes endpoint..."
    response=$(curl -s "$API_BASE_URL/v1/quotes?page=1&pageSize=10")
    if echo "$response" | grep -q '"items"'; then
        log_success "Quotes endpoint working"
        quote_count=$(echo "$response" | jq '.items | length' 2>/dev/null || echo "0")
        log_info "Found $quote_count quotes"
    else
        log_error "Quotes endpoint failed: $response"
        return 1
    fi
}

# Test invoices endpoint
test_invoices() {
    log_info "Testing invoices endpoint..."
    response=$(curl -s "$API_BASE_URL/v1/invoices?page=1&pageSize=10")
    if echo "$response" | grep -q '"items"'; then
        log_success "Invoices endpoint working"
        invoice_count=$(echo "$response" | jq '.items | length' 2>/dev/null || echo "0")
        log_info "Found $invoice_count invoices"
    else
        log_error "Invoices endpoint failed: $response"
        return 1
    fi
}

# Test time entries endpoint
test_time_entries() {
    log_info "Testing time entries endpoint..."
    response=$(curl -s "$API_BASE_URL/v1/time-entries?page=1&pageSize=10")
    if echo "$response" | grep -q '"items"'; then
        log_success "Time entries endpoint working"
        time_count=$(echo "$response" | jq '.items | length' 2>/dev/null || echo "0")
        log_info "Found $time_count time entries"
    else
        log_error "Time entries endpoint failed: $response"
        return 1
    fi
}

# Test portal endpoints (should work without auth for basic checks)
test_portal_endpoints() {
    log_info "Testing portal endpoints..."
    
    # Test portal quotes
    response=$(curl -s "$API_BASE_URL/v1/portal/quotes?page=1&pageSize=10")
    if echo "$response" | grep -q '"items"'; then
        log_success "Portal quotes endpoint working"
    else
        log_warning "Portal quotes endpoint may require authentication: $response"
    fi
    
    # Test portal invoices
    response=$(curl -s "$API_BASE_URL/v1/portal/invoices?page=1&pageSize=10")
    if echo "$response" | grep -q '"items"'; then
        log_success "Portal invoices endpoint working"
    else
        log_warning "Portal invoices endpoint may require authentication: $response"
    fi
    
    # Test portal time entries
    response=$(curl -s "$API_BASE_URL/v1/portal/time-entries?page=1&pageSize=10")
    if echo "$response" | grep -q '"items"'; then
        log_success "Portal time entries endpoint working"
    else
        log_warning "Portal time entries endpoint may require authentication: $response"
    fi
}

# Test specific entities exist
test_specific_entities() {
    log_info "Testing specific entities exist..."
    
    # Test specific quote exists
    response=$(curl -s "$API_BASE_URL/v1/quotes/quote_website_v1")
    if echo "$response" | grep -q '"id":"quote_website_v1"'; then
        log_success "Specific quote quote_website_v1 exists"
    else
        log_warning "Specific quote quote_website_v1 not found or requires auth"
    fi
    
    # Test specific invoice exists
    response=$(curl -s "$API_BASE_URL/v1/invoices/invoice_website_v1")
    if echo "$response" | grep -q '"id":"invoice_website_v1"'; then
        log_success "Specific invoice invoice_website_v1 exists"
    else
        log_warning "Specific invoice invoice_website_v1 not found or requires auth"
    fi
}

# Main execution
main() {
    log_info "Starting C2 Seed and Fixtures Smoke Test"
    
    check_backend
    run_seed
    run_fixtures
    
    log_info "Running API tests..."
    test_health
    test_quotes
    test_invoices
    test_time_entries
    test_portal_endpoints
    test_specific_entities
    
    log_success "Smoke test completed successfully!"
    log_info "Summary:"
    echo "  • Seed script: ✅ Completed"
    echo "  • Fixtures script: ✅ Completed"
    echo "  • Health endpoint: ✅ Working"
    echo "  • Quotes endpoint: ✅ Working"
    echo "  • Invoices endpoint: ✅ Working"
    echo "  • Time entries endpoint: ✅ Working"
    echo "  • Portal endpoints: ⚠️  May require authentication"
    echo ""
    log_info "Typical business flows are now available for testing!"
}

# Run main function
main "$@"
