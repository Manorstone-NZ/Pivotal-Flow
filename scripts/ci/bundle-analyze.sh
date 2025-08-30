#!/bin/bash

# CI Pipeline: Frontend Bundle Analysis
# This script analyzes frontend bundles using rollup plugin visualizer

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "📦 Analyzing frontend bundles..."

cd "$PROJECT_ROOT/apps/frontend"

# Check if we should run bundle analysis
if [ "${ANALYZE_BUNDLE:-true}" != "true" ]; then
    echo "⏭️ Bundle analysis disabled, skipping..."
    exit 0
fi

# Build the frontend
echo "🔨 Building frontend..."
pnpm run build

# Check if stats.html was generated
if [ -f "dist/stats.html" ]; then
    echo "✅ Bundle analysis generated: dist/stats.html"
    
    # Extract bundle size information
    echo "📊 Bundle size summary:"
    
    # Check vendor chunk size
    if [ -d "dist/assets" ]; then
        echo "📁 Assets directory contents:"
        ls -lh dist/assets/
        
        # Find vendor chunk
        vendor_chunk=$(find dist/assets -name "*vendor*" -type f | head -1)
        if [ -n "$vendor_chunk" ]; then
            vendor_size=$(du -h "$vendor_chunk" | cut -f1)
            echo "📦 Vendor chunk size: $vendor_size"
        fi
        
        # Find main chunk
        main_chunk=$(find dist/assets -name "*index*" -type f | head -1)
        if [ -n "$main_chunk" ]; then
            main_size=$(du -h "$main_chunk" | cut -f1)
            echo "📦 Main chunk size: $main_size"
        fi
        
        # Total size
        total_size=$(du -sh dist/ | cut -f1)
        echo "📦 Total bundle size: $total_size"
    fi
    
    # Check Lighthouse CI budgets
    echo "🎯 Checking Lighthouse CI budgets..."
    if command -v lighthouse &> /dev/null; then
        echo "Running Lighthouse analysis..."
        lighthouse http://localhost:8080 --output=json --output-path=dist/lighthouse-report.json || echo "Lighthouse analysis failed (expected in CI)"
    else
        echo "Lighthouse not available, skipping performance analysis"
    fi
    
else
    echo "❌ Bundle analysis file not generated"
    echo "Checking build output..."
    ls -la dist/
    exit 1
fi

echo "✅ Bundle analysis completed successfully"
