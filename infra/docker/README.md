# Pivotal Flow Production Docker Setup

## Overview

This directory contains the complete production Docker setup for Pivotal Flow, including:

- **Multi-stage Dockerfiles** for backend and frontend
- **Production Docker Compose** with all services
- **Monitoring stack** (Prometheus + Grafana)
- **Infrastructure services** (PostgreSQL + Redis)
- **Security configurations** and health checks

## Quick Start

### Prerequisites

1. **Docker** and **Docker Compose** installed
2. **Environment file** configured (see Environment Configuration below)
3. **At least 4GB RAM** available for containers

### Start Production Stack

```bash
# From project root
cd infra/docker

# Copy and customize environment
cp .env.production.example .env.production
# Edit .env.production with your settings

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

### Run Validation Tests

```bash
# From project root
./scripts/docker/test-prod.sh
```

## Services

### Application Services

- **Backend**: Multi-stage build with distroless runtime
  - Port: 3000
  - Health: `/health`
  - Metrics: `/metrics`
  - OpenAPI: `/api/openapi.json`

- **Frontend**: Nginx with security headers and optimizations
  - Port: 8080
  - Health: `/health`
  - Static assets with caching

### Infrastructure Services

- **PostgreSQL 16**: Production database
  - Port: 5432 (internal)
  - Optimized configuration
  - Persistent volumes

- **Redis 7**: Caching and sessions
  - Port: 6379 (internal)
  - Memory limits configured
  - Persistent volumes

### Monitoring Services

- **Prometheus**: Metrics collection
  - Port: 9090
  - Scrapes all services
  - Alert rules configured

- **Grafana**: Dashboards and visualization
  - Port: 3000
  - Admin credentials: admin/admin
  - Pre-configured datasources

## Environment Configuration

Create `.env.production` with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://pivotal:pivotal@postgres:5432/pivotal
POSTGRES_USER=pivotal
POSTGRES_PASSWORD=pivotal
POSTGRES_DB=pivotal

# Redis Configuration
REDIS_URL=redis://redis:6379

# Application Configuration
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Rate Limiting
RATE_LIMIT_DEFAULT=100
RATE_LIMIT_AUTHENTICATED=1000

# CORS Configuration
CORS_ORIGIN=http://localhost:8080,http://localhost:3000

# Monitoring
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

## Docker Images

### Backend Image (`apps/backend/Dockerfile.prod`)

- **Multi-stage build**: Dependencies → Builder → Runtime
- **Base**: `node:20-bookworm-slim` → `node:20-bookworm-slim` (optimized)
- **Size**: ~200MB
- **Security**: Non-root user, minimal dependencies
- **Features**: Health checks, Prometheus labels, dependency waiting

### Frontend Image (`apps/frontend/Dockerfile.prod`)

- **Multi-stage build**: Builder → Runtime
- **Base**: `node:20-alpine` → `nginx:1.27-alpine`
- **Size**: ~50MB
- **Security**: Non-root user, security headers
- **Features**: Gzip compression, static asset caching, SPA routing

## Health Checks

All services include comprehensive health checks:

- **Backend**: HTTP GET `/health`
- **Frontend**: HTTP GET `/health`
- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping`
- **Prometheus**: HTTP GET `/-/healthy`
- **Grafana**: HTTP GET `/api/health`

## Monitoring

### Prometheus Targets

- Backend API metrics
- PostgreSQL metrics
- Redis metrics
- Node/system metrics (if node-exporter added)

### Grafana Dashboards

- System overview
- Application performance
- Database metrics
- Infrastructure health

### Alert Rules

- Service down alerts
- High error rates
- Resource usage warnings
- Performance degradation

## Security Features

### Backend Security

- Non-root user execution
- Minimal runtime dependencies
- Environment variable configuration
- Health check endpoints

### Frontend Security

- Security headers (CSP, HSTS, X-Frame-Options)
- Non-root nginx user
- Static asset caching
- SPA routing protection

### Infrastructure Security

- Internal networking
- Resource limits
- Persistent volumes
- Health check dependencies

## Resource Management

### CPU Limits

- Backend: 1.0 CPU (0.5 reserved)
- Frontend: 0.5 CPU (0.25 reserved)
- PostgreSQL: 1.0 CPU (0.5 reserved)
- Redis: 0.5 CPU (0.25 reserved)
- Prometheus: 1.0 CPU (0.5 reserved)
- Grafana: 0.5 CPU (0.25 reserved)

### Memory Limits

- Backend: 512MB (256MB reserved)
- Frontend: 128MB (64MB reserved)
- PostgreSQL: 1GB (512MB reserved)
- Redis: 256MB (128MB reserved)
- Prometheus: 1GB (512MB reserved)
- Grafana: 512MB (256MB reserved)

## Troubleshooting

### Common Issues

1. **Services not starting**: Check resource limits and available memory
2. **Health checks failing**: Verify service dependencies and networking
3. **Database connection issues**: Check PostgreSQL configuration and volumes
4. **Frontend not loading**: Verify nginx configuration and static files

### Logs

```bash
# View all service logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Debugging

```bash
# Execute commands in containers
docker compose -f docker-compose.prod.yml exec backend sh
docker compose -f docker-compose.prod.yml exec postgres psql -U pivotal -d pivotal

# Check service health
docker compose -f docker-compose.prod.yml ps
```

## Production Deployment

### With Traefik (Reverse Proxy)

```bash
# Start with Traefik profile
docker compose -f docker-compose.prod.yml --profile traefik up -d
```

### With External Infrastructure

```bash
# Start only application services
docker compose -f docker-compose.prod.yml up -d backend frontend migrate
```

### Scaling

```bash
# Scale backend instances
docker compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Maintenance

### Updates

```bash
# Rebuild and restart services
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Backups

```bash
# Backup PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U pivotal pivotal > backup.sql

# Backup Redis
docker compose -f docker-compose.prod.yml exec redis redis-cli BGSAVE
```

### Cleanup

```bash
# Stop and remove containers
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes
docker compose -f docker-compose.prod.yml down -v

# Remove unused images
docker image prune -f
```

## Performance Optimization

### Image Optimization

- Multi-stage builds reduce final image size
- Distroless runtime minimizes attack surface
- Layer caching optimizes build times

### Runtime Optimization

- Resource limits prevent resource exhaustion
- Health checks ensure service reliability
- Monitoring provides performance insights

### Network Optimization

- Internal networking reduces latency
- Service discovery simplifies configuration
- Load balancing (with Traefik) distributes traffic