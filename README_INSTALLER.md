# Pivotal Flow System Installer

A comprehensive installer script that builds and sets up the entire Pivotal Flow system following proper dependency order.

## Quick Start

```bash
# Full installation (recommended for first-time setup)
./install.sh

# Development-only setup (faster, skips production builds)
./install.sh --dev-only

# Clean installation (removes existing builds)
./install.sh --clean --dev-only
```

## Installation Options

| Option | Description |
|--------|-------------|
| `--dev-only` | Skip production build steps, faster development setup |
| `--no-docker` | Skip Docker services (assumes external PostgreSQL/Redis) |
| `--clean` | Clean install (removes existing node_modules, builds) |
| `--help` | Show detailed help message |

## What the Installer Does

### 1. System Prerequisites Validation
- ✅ Node.js >=20.0.0
- ✅ pnpm >=8.0.0
- ✅ Docker & Docker Compose
- ✅ Git and curl

### 2. Infrastructure Setup (Docker Services)
- 🐳 PostgreSQL 15 (port 5433)
- 🐳 Redis 7 (port 6379)
- ⏳ Health checks and connection validation

### 3. Dependency Installation
- 📦 Workspace dependencies via pnpm
- 🔗 Proper workspace linking

### 4. Build Order (Critical Dependencies)
Following the exact dependency order from `DEPENDENCIES_AND_BUILD_ORDER.md`:

1. **Shared Library** (`packages/shared`) - Foundation
2. **Xero Integration** (`packages/integrations/xero`) - Depends on shared
3. **Backend Application** (`apps/backend`) - Depends on shared + Xero
4. **SDK Package** (`packages/sdk`) - Requires running backend for schema
5. **Frontend Application** (`apps/frontend`) - Depends on SDK

### 5. Database Setup
- 📊 Schema push via Drizzle ORM
- 🌱 Demo data seeding
- 🔍 Connection validation

### 6. Service Startup
- 🚀 Backend server (port 3000)
- 🚀 Frontend server (port 5173)
- ⚡ Health checks and API validation

### 7. Quality Assurance (Full Install Only)
- 🔍 TypeScript type checking
- 🧹 ESLint validation
- 🧪 Unit test execution

## After Installation

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/docs
- **OpenAPI Schema**: http://localhost:3000/api/openapi.json
- **Health Check**: http://localhost:3000/api/v1/health

### Default Credentials
- **Email**: admin@pivotalflow.com
- **Password**: password123!extra

### Log Files
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log
```

### Management Commands
```bash
# Stop all services
./scripts/dev-stop.sh

# Restart services
./scripts/start-all.sh

# Quick restart
./scripts/quick-start.sh
```

## Development Workflow

### Daily Development
```bash
# Quick start (if everything is already installed)
./scripts/quick-start.sh
```

### Clean Development Setup
```bash
# Clean install for development
./install.sh --clean --dev-only
```

### Full Production Build
```bash
# Complete installation with all quality checks
./install.sh
```

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# The installer automatically kills processes on required ports
# If manual intervention needed:
lsof -ti :3000 | xargs kill -9  # Backend
lsof -ti :5173 | xargs kill -9  # Frontend
```

**Docker Services Failed**
```bash
# Check Docker status
docker compose -f infra/docker/docker-compose.yml ps

# Restart Docker services
docker compose -f infra/docker/docker-compose.yml down
docker compose -f infra/docker/docker-compose.yml up -d
```

**Database Connection Issues**
```bash
# Check PostgreSQL container
docker exec docker-postgres-1 pg_isready -U pivotal -d pivotal_e2e

# Check Redis container
docker exec docker-redis-1 redis-cli ping
```

**Build Failures**
```bash
# Clean and retry
./install.sh --clean --dev-only

# Check specific package
pnpm --filter packages/shared build
pnpm --filter packages/sdk build
```

### Log Analysis
```bash
# Backend startup issues
tail -f logs/backend.log

# Frontend build issues
tail -f logs/frontend.log

# Docker service logs
docker compose -f infra/docker/docker-compose.yml logs
```

## System Requirements

### Minimum Requirements
- **OS**: Linux, macOS, or Windows with WSL2
- **Node.js**: 20.0.0 or higher
- **pnpm**: 8.0.0 or higher
- **Docker**: Latest version with Compose
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free space

### Network Requirements
- Ports 3000, 5173, 5433, 6379 available
- Internet connection for package downloads
- Docker registry access

## Architecture Overview

The installer follows the dependency hierarchy:

```
Infrastructure (Docker)
    ↓
Shared Library
    ↓
Xero Integration ← Backend Application
    ↓                    ↓
    └─────────→ SDK Package
                    ↓
               Frontend Application
```

This ensures that each component has its dependencies available before building, preventing build failures and ensuring system stability.

## Environment Variables

The installer automatically configures:

```bash
DATABASE_URL="postgresql://pivotal:pivotal@localhost:5433/pivotal_e2e"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-that-is-at-least-32-characters-long"
CORS_ORIGIN="http://localhost:3000,http://localhost:5173,http://localhost:5174"
OPENAPI_ENABLE="true"
NODE_ENV="development"
```

## Contributing

When modifying the installer:

1. Test with `--clean --dev-only` first
2. Test full installation
3. Verify all services start correctly
4. Check that build order is maintained
5. Update this documentation if needed

## Related Documentation

- [`DEPENDENCIES_AND_BUILD_ORDER.md`](./DEPENDENCIES_AND_BUILD_ORDER.md) - Detailed dependency analysis
- [`scripts/README.md`](./scripts/README.md) - Individual script documentation
- [`docs/docker/DOCKER_DEVELOPMENT_INSTRUCTIONS.md`](./docs/docker/DOCKER_DEVELOPMENT_INSTRUCTIONS.md) - Docker setup details
