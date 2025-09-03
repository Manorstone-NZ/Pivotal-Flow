# Docker Development Instructions

## Overview

This document provides mandatory instructions to ensure all development, testing, debugging, and related activities are performed against the Docker backend and Docker PostgreSQL environment. This ensures consistency across all development environments and prevents issues with local installations.

## 🚨 Mandatory Requirements

### Before Any Development Work

1. **ALWAYS start the Docker stack first**
2. **NEVER use local PostgreSQL or Redis installations**
3. **ALWAYS use Docker containers for all services**
4. **NEVER connect to external databases during development**

## 🚀 Getting Started

### Step 1: Start the Docker Development Stack

```bash
# From project root directory
./scripts/docker/up.sh
```

This command:
- Starts PostgreSQL 16 on port 5433
- Starts Redis 7 on port 6379
- Starts Prometheus on port 9090
- Starts Grafana on port 3001
- Sets up health checks for all services
- Creates persistent volumes for data

### Step 2: Verify Services Are Healthy

Wait for all services to be healthy before proceeding:

```bash
# Check service status
./scripts/docker/logs.sh

# Verify PostgreSQL is ready
./scripts/db/psql.sh -c "SELECT version();"

# Verify Redis is ready
./scripts/redis/cli.sh ping
```

### Step 3: Start the Backend Application

```bash
# Start the backend in Docker
./scripts/docker/start-backend.sh
```

## 🔧 Development Workflow

### Database Operations

**ALWAYS use Docker PostgreSQL:**

```bash
# Connect to PostgreSQL
./scripts/db/psql.sh

# Run migrations
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml up migrate

# Reset database (if needed)
./scripts/docker/down.sh --volumes
./scripts/docker/up.sh
```

### Backend Development

**ALWAYS use Docker backend:**

```bash
# View backend logs
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml logs backend -f

# Restart backend
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml restart backend

# Execute commands in backend container
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml exec backend sh
```

### Testing

**ALWAYS run tests against Docker services:**

```bash
# Set environment variables for Docker services
export DATABASE_URL="postgresql://pivotal:pivotal@localhost:5433/pivotal"
export REDIS_URL="redis://localhost:6379"

# Run backend tests
cd apps/backend
pnpm test

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e
```

### API Testing

**ALWAYS test against Docker backend:**

```bash
# Test health endpoint
curl -f http://localhost:3000/health

# Test API endpoints
curl -f http://localhost:3000/api/v1/endpoint

# Use timeout to avoid hanging
curl --max-time 10 http://localhost:3000/health
```

## 🛠️ Environment Configuration

### Required Environment Variables

Ensure your `.env` file contains:

```bash
# Database (Docker PostgreSQL)
DATABASE_URL=postgresql://pivotal:pivotal@localhost:5433/pivotal
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=pivotal
POSTGRES_PASSWORD=pivotal
POSTGRES_DB=pivotal

# Redis (Docker Redis)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Backend (Docker Backend)
BACKEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api/v1

# Monitoring (Docker Services)
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3001
```

### Frontend Configuration

For frontend development, ensure API calls point to Docker backend:

```typescript
// In frontend configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';
const BACKEND_URL = 'http://localhost:3000';
```

## 🔍 Debugging and Troubleshooting

### Service Health Checks

```bash
# Check all service status
./scripts/docker/logs.sh

# Check specific service
./scripts/docker/logs.sh postgres
./scripts/docker/logs.sh redis
./scripts/docker/logs.sh backend
```

### Database Debugging

```bash
# Connect to PostgreSQL
./scripts/db/psql.sh

# Check database connections
./scripts/db/psql.sh -c "SELECT * FROM pg_stat_activity;"

# Check database size
./scripts/db/psql.sh -c "SELECT pg_size_pretty(pg_database_size('pivotal'));"
```

### Backend Debugging

```bash
# View backend logs
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml logs backend -f

# Execute commands in backend container
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml exec backend sh

# Check backend health
curl -f http://localhost:3000/health
```

## 🧪 Testing Procedures

### Unit Tests

```bash
# Run unit tests against Docker services
cd apps/backend
DATABASE_URL="postgresql://pivotal:pivotal@localhost:5433/pivotal" pnpm test:unit
```

### Integration Tests

```bash
# Run integration tests against Docker services
cd apps/backend
DATABASE_URL="postgresql://pivotal:pivotal@localhost:5433/pivotal" pnpm test:integration
```

### E2E Tests

```bash
# Run E2E tests against Docker backend
cd apps/frontend
BACKEND_URL="http://localhost:3000" pnpm test:e2e
```

### Performance Tests

```bash
# Run performance tests against Docker services
cd apps/backend
DATABASE_URL="postgresql://pivotal:pivotal@localhost:5433/pivotal" pnpm test:perf
```

## 📊 Monitoring and Observability

### Access Monitoring Tools

```bash
# Prometheus (metrics)
open http://localhost:9090

# Grafana (dashboards)
open http://localhost:3001
# Login: admin/admin
```

### Database Monitoring

```bash
# Check PostgreSQL metrics
./scripts/db/psql.sh -c "SELECT * FROM pg_stat_database;"

# Check slow queries
./scripts/db/psql.sh -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

## 🚫 Prohibited Actions

### Never Do These

1. **Don't install PostgreSQL locally**
2. **Don't install Redis locally**
3. **Don't connect to external databases**
4. **Don't use local backend installations**
5. **Don't modify system PostgreSQL/Redis configurations**
6. **Don't run tests against non-Docker services**

### Common Mistakes to Avoid

```bash
# ❌ DON'T do this
sudo apt-get install postgresql
sudo systemctl start postgresql

# ❌ DON'T do this
brew install postgresql
brew services start postgresql

# ❌ DON'T do this
export DATABASE_URL="postgresql://user:pass@external-db.com:5432/db"

# ✅ DO this instead
./scripts/docker/up.sh
export DATABASE_URL="postgresql://pivotal:pivotal@localhost:5433/pivotal"
```

## 🔄 Development Workflow Checklist

### Before Starting Work

- [ ] Docker is running
- [ ] Docker stack is started (`./scripts/docker/up.sh`)
- [ ] All services are healthy
- [ ] Backend is running (`./scripts/docker/start-backend.sh`)
- [ ] Environment variables are set correctly
- [ ] Database migrations are applied

### During Development

- [ ] All database operations use Docker PostgreSQL
- [ ] All API calls go to Docker backend
- [ ] All tests run against Docker services
- [ ] All debugging uses Docker containers

### Before Committing

- [ ] All tests pass against Docker services
- [ ] No local service dependencies
- [ ] Environment variables documented
- [ ] Docker configuration is up to date

## 🛑 Stopping Development

### Graceful Shutdown

```bash
# Stop backend
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml stop backend

# Stop all services (preserve data)
./scripts/docker/down.sh

# Stop all services and remove data
./scripts/docker/down.sh --volumes
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis)
- [Project Docker README](../infra/docker/README.md)

## 🆘 Emergency Procedures

### If Docker Services Fail

1. **Check Docker status:**
   ```bash
   sudo docker info
   sudo docker compose version
   ```

2. **Restart Docker services:**
   ```bash
   ./scripts/docker/down.sh
   ./scripts/docker/up.sh
   ```

3. **Reset everything:**
   ```bash
   ./scripts/docker/down.sh --volumes
   ./scripts/docker/up.sh
   ```

### If Database is Corrupted

```bash
# Reset database
./scripts/docker/down.sh --volumes
./scripts/docker/up.sh
./scripts/docker/start-backend.sh
```

## 📝 Compliance Notes

- All development must use Docker containers
- No local service installations allowed
- All tests must run against Docker services
- Environment consistency is mandatory
- Documentation must reflect Docker usage

---

**Remember: Docker first, always! 🐳**
