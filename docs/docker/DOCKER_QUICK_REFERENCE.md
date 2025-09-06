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

### Code Quality
```bash
pnpm lint                    # Run ESLint
pnpm typecheck              # Run TypeScript compiler
pnpm test                   # Run unit and integration tests
pnpm test:e2e               # Run end-to-end tests
pnpm run qa:forbid          # Check for any types and non-null assertions
```

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

### Code Quality & Linting
```bash
# Navigate to backend
cd apps/backend

# Run TypeScript type checking
pnpm type-check

# Run ESLint (check for issues)
pnpm lint

# Run ESLint with auto-fix
pnpm lint:fix

# Check for unused variables and imports specifically
npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "(TS6133|TS6196|TS6138)"

# Run full lint check across workspace
cd ../.. && pnpm lint

# Check specific files for linting issues
pnpm lint src/modules/reports/service.ts
pnpm lint src/modules/allocations/service.ts
pnpm lint src/modules/approvals/service.ts

# Fix linting issues automatically where possible
pnpm lint:fix src/modules/reports/service.ts
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

### Background Jobs

```bash
# Create an export job
curl -X POST http://localhost:3000/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobType": "export_report",
    "payload": {
      "reportType": "quotes",
      "format": "csv",
      "filters": {
        "dateFrom": "2024-01-01",
        "dateTo": "2024-12-31"
      }
    },
    "priority": 5
  }'

# Get job status
curl -X GET http://localhost:3000/v1/jobs/{jobId}/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# List user jobs
curl -X GET "http://localhost:3000/v1/jobs?page=1&pageSize=25&status=running" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Cancel a job
curl -X POST http://localhost:3000/v1/jobs/{jobId}/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"

# Retry a failed job
curl -X POST http://localhost:3000/v1/jobs/{jobId}/retry \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### File Storage

```bash
# Generate a file
curl -X POST http://localhost:3000/v1/files/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fileType": "exports",
    "mimeType": "text/csv",
    "content": "id,name,amount\n1,Item 1,100.00\n2,Item 2,200.00",
    "description": "sample_export"
  }'

# Get signed URL for file access
curl -X POST http://localhost:3000/v1/files/signed-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fileId": "550e8400-e29b-41d4-a716-446655440000",
    "fileType": "exports"
  }'

# Download file using signed URL
curl -X GET "http://localhost:3000/v1/files/550e8400-e29b-41d4-a716-446655440000/download?token=YOUR_SIGNED_TOKEN" \
  -o downloaded_file.csv

# Get file information
curl -X GET http://localhost:3000/v1/files/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete a file
curl -X DELETE http://localhost:3000/v1/files/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Clean up expired files
curl -X POST http://localhost:3000/v1/files/cleanup \
  -H "Authorization: Bearer YOUR_TOKEN"

# View temp files directory
ls -la /tmp/pivotal-flow-files/

# Clean temp files manually
rm -rf /tmp/pivotal-flow-files/*
```

### Reference Data

```bash
# Get currencies reference data
curl -X GET http://localhost:3000/v1/reference/currencies

# Get tax classes reference data
curl -X GET http://localhost:3000/v1/reference/tax-classes

# Get roles reference data (requires auth)
curl -X GET http://localhost:3000/v1/reference/roles \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get permissions reference data (requires auth)
curl -X GET http://localhost:3000/v1/reference/permissions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get service categories reference data
curl -X GET http://localhost:3000/v1/reference/service-categories

# Get rate cards reference data (requires auth)
curl -X GET http://localhost:3000/v1/reference/rate-cards \
  -H "Authorization: Bearer YOUR_TOKEN"

# Bust cache for a specific reference type
curl -X POST http://localhost:3000/v1/reference/cache/bust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "referenceType": "currencies"
  }'
```

### Xero Integration

```bash
# Check Xero integration health status
curl -X GET http://localhost:3000/v1/integrations/xero/health \
  -H "Authorization: Bearer YOUR_TOKEN"

# Push invoice to Xero (no-op mode)
curl -X POST http://localhost:3000/v1/integrations/xero/push/invoice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "invoiceId": "inv_001",
    "operation": "create"
  }'

# Xero OAuth callback (disabled when feature off)
curl -X GET "http://localhost:3000/v1/integrations/xero/callback?code=mock_code&state=mock_state"

# Xero webhook endpoint (disabled when feature off)
curl -X POST http://localhost:3000/v1/integrations/xero/webhook \
  -H "Content-Type: application/json" \
  -H "X-Xero-Signature: mock_signature" \
  -d '{
    "events": [
      {
        "resourceId": "invoice_001",
        "resourceUri": "/api.xro/2.0/Invoices/invoice_001",
        "resourceType": "Invoice",
        "eventDateUtc": "2024-01-30T10:30:00.000Z",
        "eventType": "CREATE",
        "sequence": 1
      }
    ],
    "firstEventSequence": 1,
    "lastEventSequence": 1,
    "entropy": "mock_entropy"
  }'
```
```
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
