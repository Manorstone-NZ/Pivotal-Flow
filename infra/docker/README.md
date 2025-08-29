# Pivotal Flow - Docker Development Stack

This directory contains the Docker Compose configuration for the Pivotal Flow development environment.

## 🚀 Quick Start

### Prerequisites
- Docker installed and running
- Docker Compose v2 available
- At least 4GB RAM available for containers
- User has sudo access (or is in docker group)

### Start the Stack
```bash
# From project root
./scripts/docker/up.sh
```

This will:
- Start PostgreSQL 16, Redis 7, Prometheus, and Grafana
- Create named volumes for data persistence
- Set up health checks for all services
- Display service status and connection information

## 🔧 Common Commands

### Service Management
```bash
# Start services
./scripts/docker/up.sh

# Stop services (preserve volumes)
./scripts/docker/down.sh

# Stop services and remove volumes
./scripts/docker/down.sh --volumes

# View logs for all services
./scripts/docker/logs.sh

# View logs for specific service
./scripts/docker/logs.sh postgres
./scripts/docker/logs.sh redis
./scripts/docker/logs.sh prometheus
./scripts/docker/logs.sh grafana
```

### Database Access
```bash
# Connect to PostgreSQL
./scripts/db/psql.sh

# Connect to Redis
./scripts/redis/cli.sh
```

### Manual Docker Commands
```bash
# Check service status
docker compose -f infra/docker/docker-compose.yml ps

# View service logs
docker compose -f infra/docker/docker-compose.yml logs -f

# Execute commands in containers
docker compose -f infra/docker/docker-compose.yml exec postgres psql -U pivotal -d pivotal
docker compose -f infra/docker/docker-compose.yml exec redis redis-cli
```

## 🛑 Stopping and Cleaning

### Stop Services
```bash
./scripts/docker/down.sh
```

### Remove All Data (Volumes)
```bash
./scripts/docker/down.sh --volumes
```

### Remove Individual Volumes
```bash
docker volume rm pivotal_pgdata
docker volume rm pivotal_redisdata
docker volume rm pivotal_prometheus_data
docker volume rm pivotal_grafanadata
```

## 📊 Service Details

### PostgreSQL 16
- **Port**: 5433
- **User**: pivotal
- **Password**: pivotal
- **Database**: pivotal
- **Volume**: pgdata
- **Health Check**: `psql -U $POSTGRES_USER -d $POSTGRES_DB -c 'select 1'`

### Redis 7
- **Port**: 6379
- **Volume**: redisdata
- **Health Check**: `redis-cli -h localhost ping`

### Prometheus
- **Port**: 9090
- **Config**: `infra/docker/prometheus.yml`
- **Volume**: prometheus_data
- **Health Check**: HTTP endpoint `/-/healthy`

### Grafana
- **Port**: 3001 (mapped from container port 3000)
- **Admin User**: admin
- **Admin Password**: admin
- **Volume**: grafanadata
- **Auto-provisioning**: Prometheus datasource configured automatically
- **Health Check**: HTTP endpoint `/api/health`

## 🌐 Access URLs

- **PostgreSQL**: `localhost:5433`
- **Redis**: `localhost:6379`
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

## 🔍 Health Checks

All services include health checks that run every 5-30 seconds:

- **PostgreSQL**: Database connectivity test
- **Redis**: PING command response
- **Prometheus**: HTTP health endpoint
- **Grafana**: API health endpoint

## 📁 File Structure

```
infra/docker/
├── docker-compose.yml          # Main compose file
├── prometheus.yml              # Prometheus configuration
├── grafana/                    # Grafana provisioning
│   └── provisioning/
│       └── datasources/
│           └── datasource.yml  # Auto-configure Prometheus datasource
└── README.md                   # This file
```

## 🔧 Configuration

### Environment Variables
The stack uses environment variables from `.env` file (created from `env.example`):

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `PROMETHEUS_PORT`, `GRAFANA_PORT`
- `METRICS_ENABLED`

### Prometheus Configuration
- Global scrape interval: 15 seconds
- Backend metrics target: `localhost:3000/metrics` (commented until backend is ready)
- Self-monitoring enabled

### Grafana Auto-provisioning
- Prometheus datasource automatically configured
- Points to `http://prometheus:9090` (internal Docker network)
- Set as default datasource

## 🚨 Troubleshooting

### Services Won't Start
1. Check Docker is running: `sudo docker info`
2. Check Docker Compose version: `sudo docker compose version`
3. Verify ports are not in use: `netstat -an | grep :5432`

### Permission Issues
If you get permission denied errors:
1. **Option 1**: Use sudo with all commands (current setup)
2. **Option 2**: Add user to docker group:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```
   Then restart your terminal session

### Connection Issues
1. Wait for health checks to pass (may take 1-2 minutes)
2. Check service logs: `./scripts/docker/logs.sh <service>`
3. Verify environment variables in `.env` file

### Performance Issues
1. Ensure Docker has sufficient resources (4GB+ RAM)
2. Check container resource usage: `docker stats`
3. Consider increasing Docker Desktop memory allocation

### Data Persistence
- Volumes are preserved between restarts
- To reset data, use `./scripts/docker/down.sh --volumes`
- Individual volumes can be removed separately

## 🔄 Updates and Maintenance

### Updating Images
```bash
# Pull latest images
sudo docker compose -f infra/docker/docker-compose.yml pull

# Restart services with new images
sudo docker compose -f infra/docker/docker-compose.yml up -d
```

### Backup and Restore
```bash
# Backup PostgreSQL data
sudo docker compose -f infra/docker/docker-compose.yml exec postgres pg_dump -U pivotal pivotal > backup.sql

# Restore PostgreSQL data
sudo docker compose -f infra/docker/docker-compose.yml exec -T postgres psql -U pivotal -d pivotal < backup.sql
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis)
- [Prometheus Docker Image](https://hub.docker.com/r/prom/prometheus)
- [Grafana Docker Image](https://hub.docker.com/r/grafana/grafana)
