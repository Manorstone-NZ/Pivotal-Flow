# Pivotal Flow - Dependencies and Build Order

## Overview

This document provides a comprehensive list of all dependencies and systems used in the Pivotal Flow application, along with the correct build order for development and production environments.

## System Architecture

The Pivotal Flow application consists of multiple interconnected systems:

### Core Applications
- **Backend API** (`apps/backend`) - Fastify-based REST API with OpenAPI/Swagger documentation
- **Frontend Web App** (`apps/frontend`) - React/Vite application  
- **Python Desktop App** (`apps/python-desktop-app`) - Desktop client

### Shared Packages
- **Shared Library** (`packages/shared`) - Common utilities and types
- **SDK** (`packages/sdk`) - TypeScript API client with OpenAPI code generation
- **Xero Integration** (`packages/integrations/xero`) - Xero accounting integration

### Infrastructure Services
- **PostgreSQL** - Primary database (port 5433)
- **Redis** - Caching, session storage, and authentication (port 6379)

### API Documentation System
- **Swagger/OpenAPI 3.0** - Comprehensive API documentation
- **Swagger UI** - Interactive API explorer at `/docs`
- **OpenAPI JSON** - Machine-readable schema at `/api/openapi.json`
- **SDK Generation** - Automated TypeScript client generation from OpenAPI schema

## Dependencies Breakdown

### Runtime Dependencies

#### System Requirements
- **Node.js**: >=20.0.0
- **pnpm**: >=8.0.0 (Package Manager: pnpm@8.15.0)
- **Docker**: Latest version with Docker Compose
- **PostgreSQL**: 15-alpine (via Docker)
- **Redis**: 7-alpine (via Docker)

#### Core Backend Dependencies (`apps/backend`)
```json
{
  "fastify": "^5.6.0",
  "drizzle-orm": "^0.44.5",
  "postgres": "^3.4.7",
  "redis": "^5.8.2",
  "@fastify/jwt": "^10.0.0",
  "@fastify/cors": "^11.1.0",
  "@fastify/rate-limit": "^10.3.0",
  "@fastify/swagger": "9.5.1",
  "@fastify/swagger-ui": "5.2.3",
  "@sinclair/typebox": "^0.34.41",
  "argon2": "^0.40",
  "decimal.js": "^10.4.3",
  "pino": "^8.17.2",
  "paseto": "^4.0.1"
}
```

**Security Note**: The application uses Argon2id for password hashing instead of bcrypt for enhanced security. Argon2id provides better resistance against side-channel attacks and is the recommended choice for new applications according to current security best practices.

**Redis Implementation**: The application now includes comprehensive Redis integration for:
- **Session Storage**: Opaque token storage for PASETO authentication
- **Caching**: High-performance caching for rate cards, permissions, and business data
- **Authentication**: Secure session management with Redis-backed token storage
- **Rate Limiting**: Distributed rate limiting with Redis for API protection
- **Idempotency**: Request deduplication for critical operations

#### Core Frontend Dependencies (`apps/frontend`)
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "@tanstack/react-query": "^5.59.0",
  "@tanstack/react-table": "^8.21.3",
  "axios": "^1.6.0",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "Various versions",
  "zustand": "^4.5.4"
}
```

#### Shared Package Dependencies (`packages/shared`)
```json
{
  "drizzle-orm": "^0.44.5",
  "postgres": "^3.4.7",
  "decimal.js": "^10.4.3",
  "argon2": "^0.40.0",
  "ioredis": "^5.3.2",
  "prom-client": "^15.1.0"
}
```

**Password Security**: The shared package includes Argon2id password hashing utilities and a bcrypt compatibility layer that uses Argon2 under the hood for improved security while maintaining API compatibility.

#### SDK Dependencies (`packages/sdk`)
```json
{
  "@sinclair/typebox": "^0.34.41",
  "axios": "^1.6.0",
  "openapi-typescript": "^7.9.1",
  "orval": "^7.11.2"
}
```

### Development Dependencies

#### Testing & Quality Assurance
- **Vitest**: ^1.0.0 / ^3.2.4 (Unit testing)
- **Playwright**: ^1.40.0 (E2E testing)
- **@testing-library/react**: ^16.3.0 (Component testing)
- **@axe-core/react**: ^4.10.2 (Accessibility testing)
- **Storybook**: ^9.1.5 (Component documentation)

#### Code Quality
- **TypeScript**: ^5.3.0 / ^5.5.4
- **ESLint**: ^8.55.0 / ^9.10.0
- **Prettier**: ^3.1.0
- **@typescript-eslint/eslint-plugin**: Various versions

#### Build Tools
- **Vite**: ^5.4.2 (Frontend bundler)
- **tsup**: ^8.0.0 (SDK bundler)
- **drizzle-kit**: ^0.31.4 (Database migrations)

## Build Order and Dependencies

### 1. Infrastructure Setup (First)
```bash
# Start Docker services
docker compose -f infra/docker/docker-compose.yml up -d
```
**Dependencies**: Docker, Docker Compose
**Services**: PostgreSQL (port 5433), Redis (port 6379)

### Redis Services Configuration

#### Redis Plugin Architecture
The application includes multiple Redis integrations:

1. **Cache Service** (`src/lib/cache.service.ts`)
   - High-performance caching for business data
   - TTL-based expiration management
   - Health monitoring and statistics
   - Graceful fallback mechanisms

2. **Auth Redis Plugin** (`src/plugins/redis.ts`)
   - Opaque token storage for PASETO authentication
   - Session management with Redis backend
   - Connection pooling and error handling
   - Graceful shutdown procedures

3. **Cache Plugin** (`src/plugins/cache.plugin.ts`)
   - Fastify integration for caching
   - Admin endpoints for cache management
   - Health check endpoints
   - Statistics and monitoring

#### Redis Configuration Options
```typescript
// Environment variables
AUTH_REDIS_URL=redis://localhost:6379  // Primary Redis for auth
REDIS_URL=redis://localhost:6379       // Fallback Redis URL
CACHE_TTL_SECS=300                     // Default cache TTL (5 minutes)

// Cache service options
{
  host: 'localhost',
  port: 6379,
  password: 'optional',
  db: 0,
  keyPrefix: 'pivotal-flow:',
  ttl: 300
}
```

### 2. Shared Packages (Second)
Build order is critical due to workspace dependencies:

#### 2.1 Shared Library
```bash
cd packages/shared
pnpm build
```
**Dependencies**: TypeScript, Node.js
**Dependents**: Backend, Xero Integration

#### 2.2 SDK Package
```bash
cd packages/sdk
pnpm build
```
**Dependencies**: TypeScript, Backend API (for schema generation)
**Dependents**: Frontend

#### 2.3 Xero Integration
```bash
cd packages/integrations/xero
pnpm build
```
**Dependencies**: Shared Library
**Dependents**: Backend

### 3. Backend Application (Third)
```bash
cd apps/backend
pnpm build
```
**Dependencies**: 
- Infrastructure (PostgreSQL, Redis)
- Shared Library
- Xero Integration
**Port**: 3000

### 4. Frontend Application (Fourth)
```bash
cd apps/frontend
pnpm build
```
**Dependencies**: 
- Backend API (running)
- SDK Package
**Port**: 5173

## Development Workflow

### Quick Start (Recommended)
```bash
# Stop any existing services
./scripts/dev-stop.sh

# Start all services with proper order
./scripts/quick-start.sh
```

### Manual Development Setup
```bash
# 1. Infrastructure
docker compose -f infra/docker/docker-compose.yml up -d

# 2. Database setup
pnpm -w drizzle:push
pnpm -w seed:demo

# 3. Build shared packages
pnpm -w --filter packages/shared build
pnpm -w --filter packages/sdk build
pnpm -w --filter packages/integrations/xero build

# 4. Start backend
pnpm -w --filter apps/backend dev

# 5. Start frontend (in separate terminal)
pnpm -w --filter apps/frontend dev

# 6. Optional: Start Storybook
pnpm -w --filter apps/frontend storybook
```

## Testing and Quality Assurance

### Complete Testing Pipeline
```bash
# Type checking
pnpm -w typecheck

# Linting
pnpm -w lint

# Unit tests
pnpm -w test

# E2E tests
pnpm -w --filter apps/frontend test:e2e

# Build verification
pnpm -w --filter apps/frontend build
```

### Memory: Project Conventions
Following project-wide conventions [[memory:8367098]]:
- Use pnpm workspaces
- Strict TypeScript (no `any`, no `!`, no `console.log`)
- Run full pipeline after each edit: `pnpm -w typecheck; pnpm -w lint; pnpm -w test; pnpm -w --filter apps/frontend build`

## Production Build Order

### 1. Environment Setup
```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="<production-db-url>"
export REDIS_URL="<production-redis-url>"
```

### 2. Build All Packages
```bash
# Build in dependency order
pnpm -w --filter packages/shared build
pnpm -w --filter packages/sdk build  
pnpm -w --filter packages/integrations/xero build
pnpm -w --filter apps/backend build
pnpm -w --filter apps/frontend build
```

### 3. Database Migrations
```bash
pnpm -w --filter apps/backend drizzle:migrate
```

## Environment Variables

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string (fallback)
- `AUTH_REDIS_URL`: Redis connection for authentication sessions
- `JWT_SECRET`: JWT signing secret (min 32 characters)
- `PASETO_SECRET`: PASETO token signing secret (min 32 characters)
- `CORS_ORIGIN`: Allowed origins for CORS
- `NODE_ENV`: development/production
- `OPENAPI_ENABLE`: Enable OpenAPI documentation
- `CACHE_TTL_SECS`: Default cache TTL in seconds (default: 300)

### Development Defaults
- `DATABASE_URL`: `postgresql://pivotal:pivotal@localhost:5433/pivotal_e2e`
- `REDIS_URL`: `redis://localhost:6379`
- `AUTH_REDIS_URL`: `redis://localhost:6379` (fallback to REDIS_URL)
- `CACHE_TTL_SECS`: `300` (5 minutes)
- `CORS_ORIGIN`: `http://localhost:3000,http://localhost:5173`

## Key Scripts and Commands

### Workspace Commands
- `pnpm -w typecheck`: Type check all packages
- `pnpm -w lint`: Lint all packages
- `pnpm -w test`: Run all tests
- `pnpm -w build`: Build all packages
- `pnpm -w clean`: Clean all build artifacts

### Development Commands
- `./scripts/quick-start.sh`: Start all services quickly
- `./scripts/dev-start.sh`: Start with full health checks
- `./scripts/dev-stop.sh`: Stop all services
- `pnpm -w drizzle:push`: Push database schema
- `pnpm -w seed:demo`: Seed demo data

### API Documentation Commands
- `pnpm --filter backend openapi:smoke`: Test OpenAPI JSON endpoint
- Access Swagger UI: `http://localhost:3000/docs` (when `OPENAPI_ENABLE=true`)
- Access OpenAPI JSON: `http://localhost:3000/api/openapi.json`

### Redis/Cache Management Commands
- **Cache Health Check**: `curl http://localhost:3000/health/cache`
- **Cache Statistics**: `curl http://localhost:3000/admin/cache/stats` (admin only)
- **Clear Cache**: `curl -X POST http://localhost:3000/admin/cache/clear` (admin only)
- **Redis CLI Access**: `docker compose -f infra/docker/docker-compose.yml exec redis redis-cli`

### Quality Assurance
- `pnpm qa:check`: Type check + lint + unit tests + accessibility
- `pnpm qa:full`: Full QA including E2E tests
- `pnpm ci:comprehensive`: Full CI pipeline

## Common Issues and Solutions

### Build Order Issues
- **Problem**: Frontend build fails with SDK errors
- **Solution**: Ensure SDK is built before frontend: `pnpm -w --filter packages/sdk build`

### Database Connection Issues
- **Problem**: Backend can't connect to PostgreSQL
- **Solution**: Ensure Docker services are running: `docker compose -f infra/docker/docker-compose.yml up -d`

### Redis Connection Issues
- **Problem**: Backend can't connect to Redis
- **Solution**: 
  - Check Redis is running: `docker compose -f infra/docker/docker-compose.yml ps redis`
  - Verify Redis URL: `echo $AUTH_REDIS_URL` or `echo $REDIS_URL`
  - Test Redis connection: `redis-cli -u $REDIS_URL ping`
- **Problem**: Cache operations failing
- **Solution**: 
  - Check cache health: `curl http://localhost:3000/health/cache`
  - Verify cache configuration in environment variables
  - Check Redis logs: `docker compose -f infra/docker/docker-compose.yml logs redis`

### Port Conflicts
- **Problem**: Port 3000/5173 already in use
- **Solution**: Use dev-stop script: `./scripts/dev-stop.sh`

### TypeScript Compilation Issues
- **Problem**: Type errors in shared packages
- **Solution**: Build packages in correct order, shared library first

## Integration Points

### Backend → Database
- **ORM**: Drizzle ORM
- **Connection**: PostgreSQL via `postgres` driver
- **Migrations**: Drizzle Kit

### Backend → Cache
- **Client**: Redis via `redis` package
- **Usage**: Session storage, caching, authentication tokens
- **Services**: CacheService, Auth Redis Plugin, Cache Plugin
- **Features**: TTL management, health monitoring, graceful fallbacks

### Frontend → Backend
- **Client**: Custom SDK via Axios
- **State**: TanStack Query for server state
- **Authentication**: JWT tokens

### Validation
- **Schema**: TypeBox (not Zod) [[memory:7758939]]
- **Usage**: Both frontend and backend validation

This document should be updated whenever new dependencies are added or the build process changes.
