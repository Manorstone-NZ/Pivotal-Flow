#!/bin/bash

# CI Pipeline: Database Migration
# This script runs Drizzle migrations against an ephemeral postgres

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🗄️ Running database migrations..."

cd "$PROJECT_ROOT"

# Enable corepack for pnpm
corepack enable

# Run Drizzle migrations
echo "🚀 Running Drizzle migrations..."
cd apps/backend
pnpm drizzle-kit migrate

echo "✅ Database migrations completed successfully"

# Verify schema version
echo "📋 Current migration status:"
pnpm drizzle-kit migrate
