#!/bin/bash

# CI Pipeline: Prometheus Configuration Check
# This script validates Prometheus configuration using promtool

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🔍 Validating Prometheus configuration..."

cd "$PROJECT_ROOT/infra/docker"

# Check if promtool is available
if ! command -v promtool &> /dev/null; then
    echo "📦 Installing promtool..."
    # For Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y prometheus
    # For CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y prometheus
    # For macOS
    elif command -v brew &> /dev/null; then
        brew install prometheus
    else
        echo "❌ promtool not available and no package manager found"
        echo "Please install prometheus package manually"
        exit 1
    fi
fi

# Validate prometheus.yml
echo "📋 Validating prometheus.yml..."
if promtool check config prometheus.yml; then
    echo "✅ prometheus.yml is valid"
else
    echo "❌ prometheus.yml has errors"
    exit 1
fi

# Validate alerts.yml
echo "📋 Validating alerts.yml..."
if promtool check rules alerts.yml; then
    echo "✅ alerts.yml is valid"
else
    echo "❌ alerts.yml has errors"
    exit 1
fi

# Check for common configuration issues
echo "🔍 Checking for common configuration issues..."

# Check if backend target is configured
if grep -q "backend:3000" prometheus.yml; then
    echo "✅ Backend target configured"
else
    echo "❌ Backend target not configured"
    exit 1
fi

# Check if alerts are included
if grep -q "alerts.yml" prometheus.yml; then
    echo "✅ Alerts file included"
else
    echo "❌ Alerts file not included"
    exit 1
fi

echo "✅ All Prometheus configuration checks passed"
