# apps/backend/Dockerfile

ARG PNPM_VERSION=8.15.0

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare "pnpm@${PNPM_VERSION}" --activate

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json
# fetch both prod and dev to warm the store for prisma too
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm fetch

FROM base AS build
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app /app
COPY . .
RUN test -f apps/backend/prisma/schema.prisma || (echo "Missing apps/backend/prisma/schema.prisma" && exit 1)

# install at the workspace root to create proper node_modules and links
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# generate prisma first, then build shared
RUN pnpm -C apps/backend exec prisma -v
RUN pnpm -C apps/backend run db:generate \
 && echo "Prisma client generated successfully"

# build shared and prove dist exists
RUN pnpm -C packages/shared run build \
 && echo "Shared files emitted:" \
 && node -e "console.log(require('fs').readdirSync('packages/shared/dist'))" \
 && ls -la packages/shared/dist \
 && node -e "console.log('shared main', require('./packages/shared/package.json').main)"

# build backend
RUN pnpm -C apps/backend run build

FROM base AS deploy
COPY --from=build /app /app
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm -C apps/backend deploy --prod /out \
 && ls -la /out/node_modules/@pivotal-flow/shared \
 && ls -la /out/node_modules/.prisma \
 && node -e "console.log('deploy client', require('/out/node_modules/@prisma/client/package.json').version)"

FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
WORKDIR /app
RUN useradd -m -u 10001 nodeuser
COPY --from=deploy /out/ /app/
USER nodeuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "--enable-source-maps", "apps/backend/dist/index.js"]
