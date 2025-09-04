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

### SDK Development

```bash
# Navigate to SDK package
cd packages/sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Development mode with watch
npm run dev

# Type checking
npm run type-check

# Publish dry run
npm run publish:dry-run

# Version bump (patch/minor/major)
npm version patch
npm version minor
npm version major
```

### Seed and Fixtures

```bash
# Run seed script (creates orgs, users, roles, customers, projects, rate cards)
./scripts/dev/seed.sh

# Run fixtures script (creates quotes, invoices, payments, time entries)
./scripts/dev/fixtures.sh

# Run both scripts and perform smoke tests
./scripts/dev/smoke-test.sh

# Run seed and fixtures in sequence
./scripts/dev/seed.sh && ./scripts/dev/fixtures.sh
```

### SDK Usage Examples

```typescript
// Basic SDK usage
import { PivotalFlowClient } from '@pivotal-flow/sdk';

const client = new PivotalFlowClient({
  baseURL: 'http://localhost:3000/api/v1',
  getAccessToken: () => localStorage.getItem('accessToken')
});

// Get quotes
const quotes = await client.quotes.list({
  page: 1,
  pageSize: 10,
  status: 'approved'
});

// React Query integration
import { useQuotes } from '@pivotal-flow/sdk/react-query';

function QuotesList() {
  const { data: quotes, isLoading } = useQuotes(client, {
    page: 1,
    pageSize: 10
  });
}
```

### Create Export Job
```bash
# Create a quote cycle time export job
curl -X POST http://localhost:3000/v1/reports/export \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "quote_cycle_time",
    "format": "csv",
    "filters": {
      "organizationId": "org1",
      "fromDate": "2024-01-01T00:00:00Z",
      "toDate": "2024-12-31T23:59:59Z"
    },
    "fileName": "quote_cycle_time_2024.csv"
  }'

# Create an invoice settlement time export job
curl -X POST http://localhost:3000/v1/reports/export \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "invoice_settlement_time",
    "format": "json",
    "filters": {
      "organizationId": "org1",
      "overdueOnly": true
    }
  }'
```

### Check Export Job Status
```bash
# Get job status and progress
curl http://localhost:3000/v1/reports/export/job_1234567890 \
  -H "Authorization: Bearer <your-token>"

# List user's export jobs
curl "http://localhost:3000/v1/reports/export?page=1&limit=25" \
  -H "Authorization: Bearer <your-token>"
```

### Download Export File
```bash
# Download completed export file
curl http://localhost:3000/v1/reports/export/job_1234567890/download \
  -H "Authorization: Bearer <your-token>" \
  -o export_file.csv
```

### Get Report Summaries
```bash
# Quote cycle time summary
curl "http://localhost:3000/v1/reports/summary/quote-cycle-time?organizationId=org1&fromDate=2024-01-01T00:00:00Z" \
  -H "Authorization: Bearer <your-token>"

# Invoice settlement time summary
curl "http://localhost:3000/v1/reports/summary/invoice-settlement-time?organizationId=org1&overdueOnly=true" \
  -H "Authorization: Bearer <your-token>"

# Payments received summary
curl "http://localhost:3000/v1/reports/summary/payments-received?organizationId=org1&fromDate=2024-01-01T00:00:00Z" \
  -H "Authorization: Bearer <your-token>"

# Time approvals summary (placeholder)
curl "http://localhost:3000/v1/reports/summary/time-approvals?organizationId=org1" \
  -H "Authorization: Bearer <your-token>"
```

### Check Reporting Metrics
```bash
# View Prometheus metrics for reporting
curl http://localhost:3000/metrics | grep pivotal_export

# Check export job metrics
curl http://localhost:3000/metrics | grep -E "(pivotal_export|pivotal_report)"
```

### Test Data Isolation
```bash
# Test cross-organization isolation (should return 404)
curl "http://localhost:3000/v1/reports/summary/quote-cycle-time?organizationId=org2" \
  -H "Authorization: Bearer <org1-token>"

# Test permission checks (should return 403)
curl "http://localhost:3000/v1/reports/export" \
  -H "Authorization: Bearer <no-permission-token>" \
  -H "Content-Type: application/json" \
  -d '{"reportType": "quote_cycle_time", "format": "csv", "filters": {"organizationId": "org1"}}'
```

## Portal API Testing
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

### Reports & Exports API Testing
```bash
# Test reports endpoints (requires internal user token)
export INTERNAL_TOKEN="your-internal-user-jwt-token"

# Create export job for quote cycle time
curl -X POST -H "Authorization: Bearer $INTERNAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "quote_cycle_time",
    "format": "csv",
    "filters": {
      "organizationId": "your-org-id",
      "fromDate": "2024-01-01T00:00:00Z",
      "toDate": "2024-12-31T23:59:59Z"
    }
  }' \
  "http://localhost:3000/v1/reports/export"

# Get export job status
curl -H "Authorization: Bearer $INTERNAL_TOKEN" \
  "http://localhost:3000/v1/reports/export/{job-id}"

# Download completed export file
curl -H "Authorization: Bearer $INTERNAL_TOKEN" \
  "http://localhost:3000/v1/reports/export/{job-id}/download" \
  -o export.csv

# Get quote cycle time summary
curl -H "Authorization: Bearer $INTERNAL_TOKEN" \
  "http://localhost:3000/v1/reports/summary/quote-cycle-time?organizationId=your-org-id&fromDate=2024-01-01T00:00:00Z&toDate=2024-12-31T23:59:59Z"

# Get invoice settlement time summary
curl -H "Authorization: Bearer $INTERNAL_TOKEN" \
  "http://localhost:3000/v1/reports/summary/invoice-settlement-time?organizationId=your-org-id&overdueOnly=true"

# Get payments received summary
curl -H "Authorization: Bearer $INTERNAL_TOKEN" \
  "http://localhost:3000/v1/reports/summary/payments-received?organizationId=your-org-id&method=bank_transfer"

# Get time approvals summary (placeholder - time entries not implemented)
curl -H "Authorization: Bearer $INTERNAL_TOKEN" \
  "http://localhost:3000/v1/reports/summary/time-approvals?organizationId=your-org-id"
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
