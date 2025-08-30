# Docker Containerization Guide

This document provides comprehensive guidance for containerizing and deploying the Pivotal Flow platform using Docker.

## 🏗️ Architecture Overview

The Pivotal Flow platform is containerized using a multi-layered approach:

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Backend Container (Node.js)  │  Frontend Container (Nginx) │
│  Port: 3000                   │  Port: 8080                 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
├─────────────────────────────────────────────────────────────┤
│ PostgreSQL │ Redis │ Prometheus │ Grafana │ Migration Job │
│ Port: 5433 │ 6379  │    9090    │  3001   │   One-time    │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
infra/docker/
├── docker-compose.yml          # Infrastructure services
├── docker-compose.app.yml      # Application services
├── prometheus.yml              # Prometheus configuration
├── prometheus/
│   └── alerts.yml             # Alert rules
└── grafana/
    └── provisioning/
        ├── dashboards/         # Grafana dashboards
        └── datasources/        # Data source configuration

apps/
├── backend/
│   └── Dockerfile             # Backend container definition
└── frontend/
    └── Dockerfile             # Frontend container definition

scripts/
├── docker/
│   └── deploy-apps.sh         # Main deployment script
├── ci/                        # CI pipeline scripts
│   ├── build-docker.sh        # Docker image building
│   ├── db-migrate.sh          # Database migrations
│   ├── api-smoke.sh           # API health testing
│   ├── prometheus-check.sh    # Prometheus validation
│   └── bundle-analyze.sh      # Frontend bundle analysis
└── backup/                    # Backup and restore scripts
    ├── container-backup.sh    # Container-based backup
    └── container-restore.sh   # Container-based restore
```

## 🚀 Quick Start

### Prerequisites

1. **Docker Desktop** running
2. **Environment configuration** in `.env`
3. **Infrastructure services** already running

### Deploy Applications

```bash
# From project root
./scripts/docker/deploy-apps.sh
```

This script will:
- Check prerequisites
- Build Docker images
- Run database migrations
- Start application services
- Verify health status
- Display service URLs

### Manual Deployment

```bash
# Start infrastructure first (if not running)
cd infra/docker
docker compose up -d

# Build and run application layer
docker compose -f docker-compose.yml -f docker-compose.app.yml build
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d
```

## 🔧 Configuration

### Environment Variables

The following environment variables are required:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:pass@host:port/db
POSTGRES_USER=pivotal
POSTGRES_PASSWORD=pivotal
POSTGRES_DB=pivotal
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis Configuration
REDIS_URL=redis://redis:6379

# Application Configuration
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# Rate Limiting
RATE_LIMIT_DEFAULT=100
RATE_LIMIT_AUTHENTICATED=1000

# Performance
DB_TRACE=false
CACHE_TTL_SECS=60
```

### Docker Compose Override

The `docker-compose.app.yml` file extends the base infrastructure:

```yaml
version: "3.9"

services:
  backend:
    build:
      context: ../..
      dockerfile: apps/backend/Dockerfile
    env_file:
      - ../../.env
    environment:
      PORT: 3000
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "3000:3000"
    networks:
      - devnet
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 6

  frontend:
    build:
      context: ../..
      dockerfile: apps/frontend/Dockerfile
    depends_on:
      - backend
    ports:
      - "8080:8080"
    networks:
      - devnet

  migrate:
    image: node:20-alpine
    working_dir: /app
    env_file:
      - ../../.env
    volumes:
      - ../..:/app:ro
    entrypoint: [ "sh", "-lc", "corepack enable && pnpm -w add -D prisma && npx prisma migrate deploy" ]
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - devnet
    restart: "no"
```

## 🐳 Container Details

### Backend Container

**Base Image**: `node:20-alpine`  
**Multi-stage Build**: Dependencies → Builder → Runner  
**Security**: Non-root user (`nodeuser`)  
**Port**: 3000  
**Health Check**: HTTP GET `/health`

**Build Stages**:
1. **Dependencies**: Install pnpm and fetch dependencies
2. **Builder**: Build TypeScript and create production bundle
3. **Runner**: Minimal runtime with production artifacts

### Frontend Container

**Base Image**: `nginx:1.27-alpine`  
**Build Stage**: Node.js build environment  
**Runtime**: Nginx static file server  
**Port**: 8080  
**Features**: Code splitting, bundle analysis

### Migration Container

**Purpose**: One-time database schema updates  
**Image**: `node:20-alpine`  
**Command**: `npx prisma migrate deploy`  
**Restart Policy**: `no` (runs once and exits)

## 📊 Monitoring Integration

### Prometheus Configuration

The backend is automatically discovered by Prometheus:

```yaml
scrape_configs:
  - job_name: 'pivotal-backend'
    static_configs:
      - targets: ['backend:3000']
        labels:
          service: "backend"
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Grafana Dashboards

Four comprehensive dashboards are automatically provisioned:

1. **API Health Dashboard**: Request rates, error rates, response times
2. **Database Dashboard**: Query performance, connections, slow queries
3. **Redis Dashboard**: Cache operations, hit rates, memory usage
4. **Node Process Dashboard**: CPU, memory, event loop metrics

## 🔄 CI/CD Pipeline

### Build Pipeline

```bash
# Build Docker images
./scripts/ci/build-docker.sh

# Run database migrations
./scripts/ci/db-migrate.sh

# Validate Prometheus configuration
./scripts/ci/prometheus-check.sh
```

### Testing Pipeline

```bash
# API smoke tests
./scripts/ci/api-smoke.sh

# Frontend bundle analysis
./scripts/ci/bundle-analyze.sh
```

### Environment Variables

```bash
# Disable frontend build
BUILD_FRONTEND=false ./scripts/ci/build-docker.sh

# Disable migrations
RUN_MIGRATIONS=false ./scripts/docker/deploy-apps.sh

# Enable bundle analysis
ANALYZE_BUNDLE=true ./scripts/ci/bundle-analyze.sh
```

## 💾 Backup and Recovery

### Container-Based Backup

```bash
# Create backup
./scripts/backup/container-backup.sh

# Restore to new database
./scripts/backup/container-restore.sh backup_2024-12-01.dump -d pivotal_restored
```

### Manual Backup Commands

```bash
# Backup from host
docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $(docker ps -qf name=postgres) \
  pg_dump -U $POSTGRES_USER -d $POSTGRES_DB -F c -f /var/lib/postgresql/data/backup_$(date +%F).dump

# Restore to fresh database
docker exec -it $(docker ps -qf name=postgres) bash -lc \
  "dropdb -U $POSTGRES_USER $POSTGRES_DB && createdb -U $POSTGRES_USER $POSTGRES_DB && pg_restore -U $POSTGRES_USER -d $POSTGRES_DB /var/lib/postgresql/data/backup_FILE.dump"
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Won't Start

```bash
# Check logs
docker compose -f docker-compose.yml -f docker-compose.app.yml logs backend

# Check environment variables
docker compose -f docker-compose.yml -f docker-compose.app.yml exec backend env

# Verify database connectivity
docker compose -f docker-compose.yml -f docker-compose.app.yml exec backend \
  npx prisma db push --preview-feature
```

#### Frontend Build Fails

```bash
# Check build logs
docker compose -f docker-compose.yml -f docker-compose.app.yml build frontend

# Verify dependencies
docker run --rm -v $(pwd):/app -w /app node:20-alpine \
  sh -c "corepack enable && pnpm install --frozen-lockfile"
```

#### Prometheus Can't Scrape Backend

```bash
# Check network connectivity
docker compose -f docker-compose.yml -f docker-compose.app.yml exec prometheus \
  wget -qO- http://backend:3000/metrics

# Verify service discovery
docker compose -f docker-compose.yml -f docker-compose.app.yml exec prometheus \
  cat /etc/prometheus/prometheus.yml
```

### Health Checks

```bash
# Backend health
curl http://localhost:3000/health

# Metrics endpoint
curl http://localhost:3000/metrics | head -n 20

# Frontend
curl http://localhost:8080

# Grafana
curl http://localhost:3001

# Prometheus
curl http://localhost:9090
```

## 🔒 Security Considerations

### Container Security

- **Non-root user**: Backend runs as `nodeuser` instead of root
- **Read-only volumes**: Migration container mounts code as read-only
- **Network isolation**: Services communicate through Docker network
- **Environment variables**: Secrets loaded from `.env` file

### Network Security

- **Internal communication**: Services use Docker network names
- **Port exposure**: Only necessary ports exposed to host
- **Health checks**: Internal health verification before external access

### Data Security

- **Database credentials**: Loaded from environment variables
- **Backup encryption**: Consider encrypting backup files
- **Audit logging**: All operations logged with request IDs

## 📈 Performance Optimization

### Backend Optimization

- **Multi-stage builds**: Minimize final image size
- **Dependency caching**: pnpm lockfile ensures reproducible builds
- **Production mode**: NODE_ENV=production for optimal performance

### Frontend Optimization

- **Code splitting**: Automatic chunk generation
- **Bundle analysis**: Visualizer plugin for size monitoring
- **Static serving**: Nginx optimized for static assets

### Monitoring Optimization

- **Scrape intervals**: 15s for backend, 30s for infrastructure
- **Metric filtering**: Only essential metrics collected
- **Alert thresholds**: Configurable alerting rules

## 🚀 Deployment Strategies

### Development Deployment

```bash
# Full deployment with frontend
./scripts/docker/deploy-apps.sh

# Backend only
BUILD_FRONTEND=false ./scripts/docker/deploy-apps.sh
```

### Production Deployment

```bash
# Build production images
docker compose -f docker-compose.yml -f docker-compose.app.yml build

# Deploy with health checks
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d

# Verify deployment
docker compose -f docker-compose.yml -f docker-compose.app.yml ps
```

### Rolling Updates

```bash
# Update backend only
docker compose -f docker-compose.yml -f docker-compose.app.yml build backend
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d backend

# Update frontend only
docker compose -f docker-compose.yml -f docker-compose.app.yml build frontend
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d frontend
```

## 📚 Additional Resources

### Documentation

- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Multi-stage Docker Builds](https://docs.docker.com/develop/dev-best-practices/multistage-build/)
- [Prometheus Configuration](https://prometheus.io/docs/prometheus/latest/configuration/)
- [Grafana Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)

### Scripts Reference

- `deploy-apps.sh`: Main deployment orchestration
- `build-docker.sh`: CI image building
- `api-smoke.sh`: Health and metrics testing
- `container-backup.sh`: Database backup within containers

### Monitoring URLs

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:8080
- **Health Check**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/metrics

---

**Last Updated**: 2024-12-01  
**Maintainer**: DevOps Team  
**Version**: 1.0.0
