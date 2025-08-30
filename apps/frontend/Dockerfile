# apps/frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend/package.json apps/frontend/package.json
RUN corepack enable && pnpm fetch
COPY . .
RUN corepack enable \
 && pnpm install --frozen-lockfile \
 && pnpm -F @pivotalflow/frontend run build

# simple static server with nginx
FROM nginx:1.27-alpine
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 8080
