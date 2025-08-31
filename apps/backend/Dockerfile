# Simple Dockerfile without Prisma complexity
FROM node:20-bookworm-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build shared package
RUN pnpm -C packages/shared run build

# Build backend
RUN pnpm -C apps/backend run build

# Create non-root user
RUN useradd -m -u 10001 nodeuser

# Copy start script
COPY --chown=nodeuser:nodeuser apps/backend/start.sh ./start.sh
RUN chmod +x ./start.sh

USER nodeuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["pnpm", "-C", "apps/backend", "dev"]
