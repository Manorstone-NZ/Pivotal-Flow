#!/usr/bin/env bash
set -euo pipefail

# Generate Prisma client if missing (run as root if needed)
if [ ! -f /app/node_modules/.prisma/client/index.js ]; then
  echo "Prisma client missing. Generating at runtime..."
  if [ "$(id -u)" = "0" ]; then
    # Running as root, generate and then switch to nodeuser
    node /app/node_modules/prisma/build/index.js generate
    exec su nodeuser -c "node --enable-source-maps /app/dist/index.js"
  else
    # Not root, try to generate anyway
    node /app/node_modules/prisma/build/index.js generate
    exec node --enable-source-maps /app/dist/index.js
  fi
else
  exec node --enable-source-maps /app/dist/index.js
fi

