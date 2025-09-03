#!/usr/bin/env bash
set -euo pipefail

URL="${DATABASE_URL:-}"
ALLOW_LOCAL="${ALLOW_LOCAL_DB_CREATION:-no}"

# If DATABASE_URL is not set, try to read from drizzle config
if [[ -z "${URL}" ]]; then
  if [[ -f "drizzle.config.ts" ]]; then
    # Extract URL from drizzle config using grep
    URL=$(grep -o "url: process\.env\.DATABASE_URL || '[^']*'" drizzle.config.ts 2>/dev/null | sed "s/url: process\.env\.DATABASE_URL || '//;s/'//" || echo "")
  fi
fi

if [[ -z "${URL}" ]]; then
  echo "DATABASE_URL is not set and could not be read from drizzle config. Exiting."
  exit 1
fi

# Disallow local hosts unless explicitly allowed
if [[ "${URL}" =~ localhost|127\.0\.0\.1|postgres@postgres|postgres://postgres:.*@postgres(:|/) ]]; then
  if [[ "${ALLOW_LOCAL}" != "yes" ]]; then
    echo "Local database creation or migration is blocked. Set ALLOW_LOCAL_DB_CREATION=yes to proceed."
    exit 2
  fi
fi

exec "$@"
