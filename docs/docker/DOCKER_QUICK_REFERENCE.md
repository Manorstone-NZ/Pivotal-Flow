# Docker Development Quick Reference

## 🚀 Essential Commands

### Start Everything
```bash
./scripts/docker/up.sh
./scripts/docker/start-backend.sh
```

### Stop Everything
```bash
./scripts/docker/down.sh
```

### Check Status
```bash
./scripts/docker/logs.sh
```

## 🔗 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | `localhost:5433` | `pivotal/pivotal` |
| Redis | `localhost:6379` | - |
| Backend | `http://localhost:3000` | - |
| Prometheus | `http://localhost:9090` | - |
| Grafana | `http://localhost:3001` | `admin/admin` |

## 🛠️ Development Commands

### Database
```bash
./scripts/db/psql.sh                    # Connect to PostgreSQL
./scripts/redis/cli.sh                  # Connect to Redis
```

### Backend
```bash
# View logs
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml logs backend -f

# Restart backend
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml restart backend

# Execute in container
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.app.yml exec backend sh
```

### Testing
```bash
# Set environment
export DATABASE_URL="postgresql://pivotal:pivotal@localhost:5433/pivotal"
export REDIS_URL="redis://localhost:6379"

# Run tests
cd apps/backend && pnpm test
```

### Portal API Testing
```bash
# Test portal endpoints (requires external customer user token)
export PORTAL_TOKEN="your-external-customer-jwt-token"

# List customer quotes
curl -H "Authorization: Bearer $PORTAL_TOKEN" \
  "http://localhost:3000/v1/portal/quotes"

# Get quote detail
curl -H "Authorization: Bearer $PORTAL_TOKEN" \
  "http://localhost:3000/v1/portal/quotes/{quote-id}"

# List customer invoices
curl -H "Authorization: Bearer $PORTAL_TOKEN" \
  "http://localhost:3000/v1/portal/invoices"

# Get invoice detail
curl -H "Authorization: Bearer $PORTAL_TOKEN" \
  "http://localhost:3000/v1/portal/invoices/{invoice-id}"

# List approved time entries
curl -H "Authorization: Bearer $PORTAL_TOKEN" \
  "http://localhost:3000/v1/portal/time"

# Portal health check
curl -H "Authorization: Bearer $PORTAL_TOKEN" \
  "http://localhost:3000/v1/portal/health"

# Rate limit testing (check headers)
curl -v -H "Authorization: Bearer $PORTAL_TOKEN" \
  "http://localhost:3000/v1/portal/quotes" 2>&1 | grep -i ratelimit
```

## 🚫 Never Do
- Install PostgreSQL/Redis locally
- Connect to external databases
- Use local backend installations
- Run tests against non-Docker services

## 🆘 Emergency Reset
```bash
./scripts/docker/down.sh --volumes
./scripts/docker/up.sh
./scripts/docker/start-backend.sh
```

---
**Docker First, Always! 🐳**
