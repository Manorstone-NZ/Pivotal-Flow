# E7 E2E & Contract Safety Analysis

## Current State Analysis

### 1. Contract Infrastructure Status

#### OpenAPI Schema Generation ✅
- **Location**: Backend generates OpenAPI 3.1.0 spec at `/api/openapi.json`
- **SDK Generation**: Multiple scripts available (`generate.ts`, `generate-enhanced.ts`)
- **Tools**: Uses `openapi-typescript` and `orval` for type generation
- **Output**: Types generated to `packages/sdk/src/gen/types.ts`

#### Current SDK Structure ✅
- **Package**: `@pivotal-flow/sdk` workspace package
- **Client**: Manual TypeScript client with Axios
- **Types**: Generated from OpenAPI spec
- **Integration**: Frontend uses SDK for API calls

#### Contract Validation Gap ❌
- **Missing**: Runtime validation of API contracts
- **Missing**: Zod schemas for request/response validation
- **Missing**: CI enforcement of schema changes
- **Missing**: Contract tests against actual API responses

### 2. E2E Testing Infrastructure Status

#### Playwright Setup ✅
- **Configuration**: `playwright.config.ts` with multi-browser support
- **Test Structure**: Basic smoke tests exist
- **Coverage**: Login, protected routes, basic navigation
- **Tags**: No @smoke tags currently implemented

#### Docker Integration ⚠️
- **Current**: Basic `docker-compose.dev.yml` exists
- **Missing**: Dedicated E2E Docker Compose files
- **Missing**: E2E-specific scripts (`up.sh`, `down.sh`)
- **Missing**: Health check waiting for services

#### Test Coverage Gaps ❌
- **Missing**: Full user journey tests (login → dashboard → quotes → details → logout)
- **Missing**: Tests against seeded demo data
- **Missing**: Contract validation in E2E tests
- **Missing**: API response validation

### 3. Seeding Infrastructure Status

#### Existing Seed Scripts ✅
- **Location**: `scripts/dev/` directory
- **Scripts**: `seed.sh`, `fixtures.sh`, `smoke-test.sh`
- **Data**: Organizations, users, customers, projects, rate cards
- **Idempotent**: Scripts designed to be safe to re-run

#### Seed Data Coverage ✅
- **Users**: Admin, manager, consultant, customer users
- **Organizations**: ACME, TechStart, Consulting Partners
- **Rate Cards**: Standard and premium rate cards
- **Projects**: Website, mobile, consulting projects

#### Frontend Demo Data Gap ❌
- **Missing**: Frontend-specific seeding script
- **Missing**: Quote line items for demo
- **Missing**: Integration with E2E test data

### 4. CI Pipeline Status

#### Current CI Structure ✅
- **Workflows**: E5 QA pipeline exists
- **Jobs**: Unit tests, E2E tests, Docker integration, accessibility
- **Artifacts**: Coverage reports, test results

#### Missing CI Components ❌
- **Missing**: Contract validation step
- **Missing**: SDK generation verification
- **Missing**: Proper job ordering (qa-forbid → typecheck → backend → seed → sdk → frontend → e2e)
- **Missing**: OpenAPI hash checking

## Implementation Plan

### Phase 1: Contract Tests Implementation

#### 1.1 Zod Schema Generation
- **Tool**: Use `openapi-zod-client` or `zodios` for runtime validation
- **Location**: `packages/sdk/src/contracts/`
- **Purpose**: Validate API requests/responses at runtime
- **Integration**: Add to existing SDK client

#### 1.2 Contract Test Suite
- **Location**: `apps/frontend/tests/contracts/`
- **Tests**: Validate all SDK calls match OpenAPI spec
- **Coverage**: All API endpoints used by frontend
- **CI Integration**: Fail if contracts don't match

#### 1.3 Schema Change Detection
- **Implementation**: Hash-based checking of `openapi.json`
- **CI Step**: Fail if hash changed but SDK not regenerated
- **Artifacts**: Store OpenAPI hash in CI artifacts

### Phase 2: E2E Docker Infrastructure

#### 2.1 Docker Compose Files
- **Base**: `infra/docker/docker-compose.yml` (infrastructure)
- **App**: `infra/docker/docker-compose.app.dev.yml` (application)
- **Services**: PostgreSQL, Redis, Backend, Frontend
- **Health Checks**: Proper service readiness detection

#### 2.2 E2E Scripts
- **Up Script**: `scripts/e2e/up.sh` (compose up + wait for health)
- **Down Script**: `scripts/e2e/down.sh` (cleanup)
- **Health Checks**: Wait for `/health` and `/docs` endpoints
- **Timeout**: Proper timeout handling

#### 2.3 Smoke Test Enhancement
- **Tags**: Add `@smoke` tags to critical tests
- **Journey**: login → dashboard → quotes → quote details → logout
- **Data**: Use seeded demo data for realistic testing
- **Validation**: Contract validation in E2E tests

### Phase 3: Frontend Demo Seeding

#### 3.1 Frontend Seed Script
- **Location**: `scripts/dev-tools/seed_frontend_demo.ts`
- **Data**: 2 users, 1 rate card, 3 quotes with line items
- **Idempotent**: Safe to run multiple times
- **Integration**: Works with existing backend seeding

#### 3.2 Demo Data Structure
- **Users**: Admin user, regular user
- **Rate Card**: Standard rate card with service categories
- **Quotes**: 3 quotes with different statuses and line items
- **Line Items**: Detailed line items with rates and quantities

### Phase 4: CI Pipeline Integration

#### 4.1 Job Ordering
1. **qa-forbid**: Check for `any` types and non-null assertions
2. **typecheck**: TypeScript compilation
3. **backend-build**: Build backend and run migrations
4. **seed**: Run seeding scripts
5. **sdk-gen**: Generate SDK from OpenAPI
6. **frontend-build**: Build frontend
7. **e2e-docker**: Run E2E tests in Docker

#### 4.2 Artifacts
- **playwright-report**: E2E test results
- **coverage**: Test coverage reports
- **openapi.json**: OpenAPI schema for contract validation

## Risk Assessment

### High Risk Items
1. **Contract Mismatches**: Frontend SDK calls may not match backend API
2. **Schema Drift**: OpenAPI spec may drift from actual implementation
3. **E2E Flakiness**: Docker-based E2E tests may be unstable
4. **Data Dependencies**: E2E tests depend on seeded data consistency

### Mitigation Strategies
1. **Contract Tests**: Automated validation prevents mismatches
2. **Schema Validation**: CI enforcement of schema changes
3. **Health Checks**: Proper service readiness detection
4. **Idempotent Seeding**: Consistent test data across runs

## Success Criteria

### Contract Safety
- ✅ All frontend SDK calls validated against OpenAPI spec
- ✅ CI fails if schema changes without SDK regeneration
- ✅ Runtime validation prevents contract violations
- ✅ Contract tests cover all API endpoints

### E2E Reliability
- ✅ Docker-based E2E tests run consistently
- ✅ Full user journey tests pass reliably
- ✅ Tests use seeded demo data
- ✅ Health checks ensure service readiness

### CI Integration
- ✅ Proper job ordering prevents race conditions
- ✅ Artifacts capture all necessary data
- ✅ Pipeline fails fast on contract violations
- ✅ E2E tests run against real backend

## Next Steps

1. **Implement contract tests** with Zod validation
2. **Create E2E Docker infrastructure** with proper health checks
3. **Develop frontend seeding script** for demo data
4. **Integrate CI pipeline** with proper job ordering
5. **Validate end-to-end** contract safety and E2E reliability

This analysis provides the foundation for implementing comprehensive contract safety and E2E testing infrastructure.
