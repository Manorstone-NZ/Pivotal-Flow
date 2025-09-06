#!/bin/bash
set -e

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
until pg_isready -h "${POSTGRES_HOST:-postgres}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-pivotal}" -d "${POSTGRES_DB:-pivotal}"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is ready!"

# Wait for Redis
echo "Waiting for Redis..."
until redis-cli -h "${REDIS_HOST:-redis}" -p "${REDIS_PORT:-6379}" ping; do
  echo "Redis is unavailable - sleeping"
  sleep 2
done
echo "Redis is ready!"

# Run database migrations if MIGRATE_ON_START is true
if [ "${MIGRATE_ON_START:-false}" = "true" ]; then
  echo "Running database migrations..."
  cd /app
  corepack enable
  pnpm db:migrate:ci
  echo "Database migrations completed!"
fi

# Start the application
echo "Starting Pivotal Flow Backend..."
exec node dist/index.js
