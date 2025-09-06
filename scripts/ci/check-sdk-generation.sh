#!/bin/bash

# CI Check Script for D4 Contract Stability
# Ensures SDK is up to date with OpenAPI specification

set -e

echo "🔍 Checking if SDK is up to date with OpenAPI spec..."

# Change to project root
cd "$(dirname "$0")/../.."

# Check if backend is running
if ! curl -s http://localhost:3000/api/openapi.json > /dev/null 2>&1; then
  echo "❌ Backend server is not running on http://localhost:3000"
  echo "💡 Please start the backend server with: pnpm dev"
  exit 1
fi

# Generate SDK to check for changes
echo "🔄 Generating SDK types..."
pnpm sdk:generate

# Check if any files changed
if git diff --quiet packages/sdk/src/gen/; then
  echo "✅ SDK is up to date with OpenAPI spec"
else
  echo "❌ SDK is out of date with OpenAPI spec"
  echo "📝 Changes detected in:"
  git diff --name-only packages/sdk/src/gen/
  echo ""
  echo "💡 Please run 'pnpm sdk:generate' and commit the changes"
  echo "💡 Or add 'pnpm sdk:generate' to your pre-commit hooks"
  exit 1
fi

