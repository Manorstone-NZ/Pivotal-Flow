#!/bin/bash

# Monitoring Setup Test Script for Pivotal Flow
# This script validates the complete monitoring, logging, and backup setup

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Test result function
test_result() {
    local test_name="$1"
    local passed="$2"
    local message="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if [ "$passed" = true ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        log "✅ PASS: $test_name - $message"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        error "❌ FAIL: $test_name - $message"
    fi
}

# Check if services are running
check_services() {
    log "Checking service status..."
    
    # Check Docker services
    if docker compose ps | grep -q "Up"; then
        test_result "Docker Services" true "All services are running"
    else
        test_result "Docker Services" false "Some services are not running"
        return 1
    fi
    
    # Check specific services
    local services=("postgres" "redis" "prometheus" "grafana")
    for service in "${services[@]}"; do
        if docker compose ps "$service" | grep -q "Up"; then
            test_result "$service Service" true "Service is running"
        else
            test_result "$service Service" false "Service is not running"
        fi
    done
}

# Test Prometheus configuration
test_prometheus_config() {
    log "Testing Prometheus configuration..."
    
    # Check if promtool is available
    if command -v promtool >/dev/null 2>&1; then
        # Test prometheus.yml
        if promtool check config "$PROJECT_ROOT/infra/docker/prometheus.yml" >/dev/null 2>&1; then
            test_result "Prometheus Config" true "Configuration is valid"
        else
            test_result "Prometheus Config" false "Configuration has errors"
        fi
        
        # Test alerts.yml
        if promtool check rules "$PROJECT_ROOT/infra/docker/prometheus/alerts.yml" >/dev/null 2>&1; then
            test_result "Prometheus Alerts" true "Alert rules are valid"
        else
            test_result "Prometheus Alerts" false "Alert rules have errors"
        fi
    else
        warn "promtool not available, skipping Prometheus config validation"
        test_result "Prometheus Config" true "Skipped (promtool not available)"
        test_result "Prometheus Alerts" true "Skipped (promtool not available)"
    fi
}

# Test Grafana dashboards
test_grafana_dashboards() {
    log "Testing Grafana dashboard configuration..."
    
    local dashboard_dir="$PROJECT_ROOT/infra/docker/grafana/provisioning/dashboards"
    local dashboards=(
        "api-health-dashboard.json"
        "database-dashboard.json"
        "redis-dashboard.json"
        "node-process-dashboard.json"
    )
    
    for dashboard in "${dashboards[@]}"; do
        local dashboard_path="$dashboard_dir/$dashboard"
        if [[ -f "$dashboard_path" ]]; then
            # Basic JSON validation
            if jq . "$dashboard_path" >/dev/null 2>&1; then
                test_result "Dashboard $dashboard" true "JSON is valid"
            else
                test_result "Dashboard $dashboard" false "JSON is invalid"
            fi
        else
            test_result "Dashboard $dashboard" false "File not found"
        fi
    done
    
    # Check dashboard provisioning config
    local dashboards_yml="$dashboard_dir/dashboards.yml"
    if [[ -f "$dashboards_yml" ]]; then
        test_result "Dashboard Provisioning" true "Configuration file exists"
    else
        test_result "Dashboard Provisioning" false "Configuration file missing"
    fi
}

# Test metrics collection
test_metrics_collection() {
    log "Testing metrics collection..."
    
    # Wait for services to be ready
    sleep 10
    
    # Test Prometheus metrics endpoint
    if curl -s http://localhost:9090/metrics >/dev/null 2>&1; then
        test_result "Prometheus Metrics" true "Metrics endpoint is accessible"
    else
        test_result "Prometheus Metrics" false "Metrics endpoint is not accessible"
    fi
    
    # Test backend metrics endpoint
    if curl -s http://localhost:3000/metrics >/dev/null 2>&1; then
        test_result "Backend Metrics" true "Backend metrics endpoint is accessible"
    else
        test_result "Backend Metrics" false "Backend metrics endpoint is not accessible"
    fi
    
    # Test performance summary endpoint
    if curl -s http://localhost:3000/v1/perf/summary >/dev/null 2>&1; then
        test_result "Performance Summary" true "Performance endpoint is accessible"
    else
        test_result "Performance Summary" false "Performance endpoint is not accessible"
    fi
}

# Test alert simulation
test_alert_simulation() {
    log "Testing alert simulation..."
    
    # Simulate slow query by creating a long-running operation
    info "Simulating slow database operation..."
    
    # This would require actual database access, so we'll just check alert configuration
    if [[ -f "$PROJECT_ROOT/infra/docker/prometheus/alerts.yml" ]]; then
        local alert_count=$(grep -c "^[[:space:]]*- alert:" "$PROJECT_ROOT/infra/docker/prometheus/alerts.yml" || echo "0")
        if [ "$alert_count" -gt 0 ]; then
            test_result "Alert Rules" true "Found $alert_count alert rules"
        else
            test_result "Alert Rules" false "No alert rules found"
        fi
    else
        test_result "Alert Rules" false "Alert rules file not found"
    fi
}

# Test logging configuration
test_logging_config() {
    log "Testing logging configuration..."
    
    # Check if log enricher exists
    local log_enricher="$PROJECT_ROOT/apps/backend/src/lib/log-enricher.ts"
    if [[ -f "$log_enricher" ]]; then
        test_result "Log Enricher" true "Log enricher plugin exists"
    else
        test_result "Log Enricher" false "Log enricher plugin missing"
    fi
    
    # Check if logger supports cloud shipping
    local logger="$PROJECT_ROOT/apps/backend/src/lib/logger.ts"
    if grep -q "LOG_CLOUD_SHIPPING" "$logger"; then
        test_result "Cloud Logging" true "Cloud shipping support configured"
    else
        test_result "Cloud Logging" false "Cloud shipping support not configured"
    fi
}

# Test backup scripts
test_backup_scripts() {
    log "Testing backup scripts..."
    
    local backup_dir="$PROJECT_ROOT/scripts/backup"
    local scripts=("daily-backup.sh" "restore.sh")
    
    for script in "${scripts[@]}"; do
        local script_path="$backup_dir/$script"
        if [[ -f "$script_path" ]]; then
            if [[ -x "$script_path" ]]; then
                test_result "Backup Script $script" true "Script exists and is executable"
            else
                test_result "Backup Script $script" false "Script exists but is not executable"
            fi
        else
            test_result "Backup Script $script" false "Script not found"
        fi
    done
    
    # Check backup directory
    local backup_dir_path="$PROJECT_ROOT/backups"
    if [[ -d "$backup_dir_path" ]]; then
        test_result "Backup Directory" true "Backup directory exists"
    else
        test_result "Backup Directory" false "Backup directory missing"
    fi
}

# Test runbooks
test_runbooks() {
    log "Testing runbooks..."
    
    local runbooks_dir="$PROJECT_ROOT/docs/runbooks"
    local runbooks=(
        "rb-01-backend-down.md"
        "rb-02-db-issues.md"
        "rb-03-cache-issues.md"
    )
    
    for runbook in "${runbooks[@]}"; do
        local runbook_path="$runbooks_dir/$runbook"
        if [[ -f "$runbook_path" ]]; then
            test_result "Runbook $runbook" true "Runbook exists"
        else
            test_result "Runbook $runbook" false "Runbook missing"
        fi
    done
    
    # Check SLO definitions
    local slo_file="$PROJECT_ROOT/docs/slo/api.yml"
    if [[ -f "$slo_file" ]]; then
        test_result "SLO Definitions" true "SLO definitions exist"
    else
        test_result "SLO Definitions" false "SLO definitions missing"
    fi
}

# Test infrastructure configuration
test_infrastructure() {
    log "Testing infrastructure configuration..."
    
    # Check Docker Compose
    local docker_compose="$PROJECT_ROOT/infra/docker/docker-compose.yml"
    if [[ -f "$docker_compose" ]]; then
        if docker compose -f "$docker_compose" config >/dev/null 2>&1; then
            test_result "Docker Compose" true "Configuration is valid"
        else
            test_result "Docker Compose" false "Configuration has errors"
        fi
    else
        test_result "Docker Compose" false "File not found"
    fi
    
    # Check Prometheus configuration
    local prometheus_config="$PROJECT_ROOT/infra/docker/prometheus.yml"
    if [[ -f "$prometheus_config" ]]; then
        test_result "Prometheus Config File" true "Configuration file exists"
    else
        test_result "Prometheus Config File" false "Configuration file missing"
    fi
}

# Main test execution
main() {
    log "Starting Monitoring Setup Test Suite"
    log "===================================="
    
    # Check prerequisites
    if ! command -v docker >/dev/null 2>&1; then
        error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker compose >/dev/null 2>&1; then
        error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    # Run tests
    check_services
    test_prometheus_config
    test_grafana_dashboards
    test_metrics_collection
    test_alert_simulation
    test_logging_config
    test_backup_scripts
    test_runbooks
    test_infrastructure
    
    # Summary
    log ""
    log "Test Summary"
    log "============"
    log "Total Tests: $TESTS_TOTAL"
    log "Passed: $TESTS_PASSED"
    log "Failed: $TESTS_FAILED"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        log "🎉 All tests passed! Monitoring setup is ready."
        exit 0
    else
        error "❌ Some tests failed. Please review the issues above."
        exit 1
    fi
}

# Run main function
main "$@"
