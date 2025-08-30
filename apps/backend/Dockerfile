# apps/backend/Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN corepack enable && pnpm fetch

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app /app
COPY . .
RUN corepack enable \
 && pnpm install --frozen-lockfile \
 && pnpm -F @pivotalflow/backend run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# create nonroot user
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
USER nodeuser
EXPOSE 3000
CMD ["node", "apps/backend/dist/index.js"]
