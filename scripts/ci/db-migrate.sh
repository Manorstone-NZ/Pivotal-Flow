#!/bin/bash

# CI Pipeline: Database Migration
# This script runs Prisma migrations against an ephemeral postgres

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🗄️ Running database migrations..."

cd "$PROJECT_ROOT"

# Enable corepack for pnpm
corepack enable

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm -w prisma generate

# Run migrations
echo "🚀 Running Prisma migrations..."
pnpm -w prisma migrate deploy

echo "✅ Database migrations completed successfully"

# Verify schema version
echo "📋 Current schema version:"
pnpm -w prisma migrate status
