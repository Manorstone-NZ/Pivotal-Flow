# D3: API Contract Stability Plan

## Overview
This plan ensures the API surface is stable and consistent for frontend integration by standardizing CORS, authentication, pagination, error handling, and caching across all endpoints.

## Current State Analysis

### ✅ **Existing Strengths**
- **SDK Package**: Well-structured TypeScript SDK with comprehensive type definitions
- **Authentication**: JWT + refresh token system with proper cookie handling
- **Error Handling**: Structured error responses with codes and request IDs
- **Pagination**: Comprehensive pagination utilities with filtering support
- **CORS**: Environment-specific CORS configuration with proper headers
- **Rate Limiting**: Route-specific rate limiting with proper headers

### ⚠️ **Identified Issues**
1. **Pagination Inconsistency**: Multiple pagination schemas (`page/pageSize` vs `page/size`)
2. **Error Envelope Variations**: Different error response shapes across endpoints
3. **CORS Configuration**: Not using `@fastify/cors` plugin, manual configuration
4. **Cache Headers**: Missing ETag/Last-Modified and Cache-Control headers
5. **CSRF Protection**: No CSRF token implementation for cookie-protected endpoints
6. **Type Safety**: Some endpoints return `unknown` types instead of proper DTOs

## Implementation Plan

### Phase 1: CORS Standardization
**Goal**: Use `@fastify/cors` plugin with environment-based origins

**Changes**:
1. Install `@fastify/cors` plugin
2. Replace manual CORS configuration with plugin
3. Use `CORS_ORIGIN` environment variable (comma-separated)
4. Enable `credentials: true` for all environments
5. Add preflight verification

**Acceptance Criteria**:
- All CORS headers properly set via plugin
- Preflight requests handled correctly
- Credentials enabled for authenticated requests
- Environment-specific origins working

### Phase 2: Authentication Mode Standardization
**Goal**: Bearer token for state-changing calls, refresh cookie for token refresh only

**Changes**:
1. Keep refresh cookie `httpOnly` for token refresh only
2. All state-changing operations use Bearer token authentication
3. Implement double-submit CSRF token for any cookie-protected POSTs
4. Update SDK to handle Bearer token authentication properly

**Acceptance Criteria**:
- Login returns Bearer token for API calls
- Refresh cookie only used for token refresh
- CSRF protection on cookie-protected endpoints
- SDK properly handles token refresh flow

### Phase 3: Pagination Unification
**Goal**: Standardize on `page, size, sort, filter` query params and `{ data, meta }` response

**Changes**:
1. Update pagination schema to use `page, size, sort, filter`
2. Standardize response format: `{ data: T[], meta: { page, size, total } }`
3. Fix `apps/backend/src/lib/pagination.ts` to use Zod parsing
4. Remove `unknown` types, ensure all responses are properly typed
5. Update SDK types to match new pagination format

**Acceptance Criteria**:
- All list endpoints use consistent pagination format
- Zod validation for all pagination parameters
- No `unknown` types in pagination responses
- SDK types match backend implementation

### Phase 4: Error Envelope Standardization
**Goal**: Single error handler with `{ error: { code, message, details? }, requestId }` format

**Changes**:
1. Create centralized error handler
2. Standardize error response format across all endpoints
3. Ensure all errors include request ID
4. Update SDK error handling to match new format

**Acceptance Criteria**:
- All errors use consistent envelope format
- Request ID included in all error responses
- SDK properly handles error responses
- No inconsistent error formats

### Phase 5: Cache Headers Implementation
**Goal**: Add ETag/Last-Modified for safe GETs and Cache-Control headers

**Changes**:
1. Add ETag generation for GET endpoints
2. Add Last-Modified headers based on resource timestamps
3. Implement Cache-Control headers based on resource volatility
4. Expose rate-limit headers in responses
5. Add cache validation middleware

**Acceptance Criteria**:
- ETag headers on all GET endpoints
- Last-Modified headers for resources with timestamps
- Appropriate Cache-Control headers
- Rate-limit headers exposed in responses

## Endpoint → DTO → Frontend Mapping

### **Authentication Endpoints**
```
POST /auth/login
├── Request: LoginRequest { email, password, mfaCode? }
├── Response: LoginResponse { accessToken, user, expiresIn }
└── Frontend: Login form → Store token → Redirect to dashboard

POST /auth/refresh  
├── Request: RefreshTokenRequest { refreshToken }
├── Response: RefreshTokenResponse { accessToken, expiresIn }
└── Frontend: Automatic token refresh → Update stored token

POST /auth/logout
├── Request: LogoutRequest { refreshToken }
├── Response: LogoutResponse { message }
└── Frontend: Clear tokens → Redirect to login

GET /auth/me
├── Request: None
├── Response: MeResponse { user }
└── Frontend: Get current user → Update user context
```

### **User Management Endpoints**
```
GET /v1/users
├── Request: UserFilters { page, size, sort, filter, role?, status?, organizationId? }
├── Response: PaginationEnvelope<User> { data: User[], meta: { page, size, total } }
└── Frontend: User list table → Pagination controls → Filter/sort UI

GET /v1/users/:id
├── Request: None
├── Response: User { id, email, firstName, lastName, status, roles, ... }
└── Frontend: User detail page → Edit form

POST /v1/users
├── Request: CreateUserRequest { email, firstName, lastName, password, organizationId, roles? }
├── Response: User { id, email, firstName, lastName, status, roles, ... }
└── Frontend: Create user form → Submit → Redirect to user list

PATCH /v1/users/:id
├── Request: UpdateUserRequest { firstName?, lastName?, email?, status? }
├── Response: User { id, email, firstName, lastName, status, roles, ... }
└── Frontend: Edit user form → Submit → Update user detail
```

### **Quote Management Endpoints**
```
GET /v1/quotes
├── Request: QuoteFilters { page, size, sort, filter, status?, customerId?, projectId?, validFrom?, validUntil? }
├── Response: PaginationEnvelope<Quote> { data: Quote[], meta: { page, size, total } }
└── Frontend: Quote list table → Pagination → Filter/sort UI

GET /v1/quotes/:id
├── Request: None
├── Response: Quote { id, customerId, projectId, status, totalAmount, currency, lineItems, ... }
└── Frontend: Quote detail page → Edit form → Status transitions

POST /v1/quotes
├── Request: CreateQuoteRequest { customerId, projectId?, currency, validFrom, validUntil, lineItems, ... }
├── Response: Quote { id, customerId, projectId, status, totalAmount, currency, lineItems, ... }
└── Frontend: Create quote form → Submit → Redirect to quote detail

PATCH /v1/quotes/:id
├── Request: UpdateQuoteRequest { customerId?, projectId?, currency?, validFrom?, validUntil?, lineItems?, ... }
├── Response: Quote { id, customerId, projectId, status, totalAmount, currency, lineItems, ... }
└── Frontend: Edit quote form → Submit → Update quote detail

POST /v1/quotes/:id/status
├── Request: QuoteStatusTransitionRequest { status, notes? }
├── Response: Quote { id, customerId, projectId, status, totalAmount, currency, lineItems, ... }
└── Frontend: Status transition UI → Submit → Update quote status
```

### **Customer Management Endpoints**
```
GET /v1/customers
├── Request: CustomerFilters { page, size, sort, filter, status?, type?, organizationId? }
├── Response: PaginationEnvelope<Customer> { data: Customer[], meta: { page, size, total } }
└── Frontend: Customer list table → Pagination → Filter/sort UI

GET /v1/customers/:id
├── Request: None
├── Response: Customer { id, name, email, phone, address, status, ... }
└── Frontend: Customer detail page → Edit form

POST /v1/customers
├── Request: CreateCustomerRequest { name, email, phone, address, ... }
├── Response: Customer { id, name, email, phone, address, status, ... }
└── Frontend: Create customer form → Submit → Redirect to customer list

PATCH /v1/customers/:id
├── Request: UpdateCustomerRequest { name?, email?, phone?, address?, status?, ... }
├── Response: Customer { id, name, email, phone, address, status, ... }
└── Frontend: Edit customer form → Submit → Update customer detail
```

### **Project Management Endpoints**
```
GET /v1/projects
├── Request: ProjectFilters { page, size, sort, filter, status?, customerId?, projectManagerId?, priority? }
├── Response: PaginationEnvelope<Project> { data: Project[], meta: { page, size, total } }
└── Frontend: Project list table → Pagination → Filter/sort UI

GET /v1/projects/:id
├── Request: None
├── Response: Project { id, name, customerId, status, startDate, endDate, priority, ... }
└── Frontend: Project detail page → Edit form

POST /v1/projects
├── Request: CreateProjectRequest { name, customerId, startDate, endDate, priority, ... }
├── Response: Project { id, name, customerId, status, startDate, endDate, priority, ... }
└── Frontend: Create project form → Submit → Redirect to project list

PATCH /v1/projects/:id
├── Request: UpdateProjectRequest { name?, customerId?, startDate?, endDate?, priority?, ... }
├── Response: Project { id, name, customerId, status, startDate, endDate, priority, ... }
└── Frontend: Edit project form → Submit → Update project detail
```

### **Invoice Management Endpoints**
```
GET /v1/invoices
├── Request: InvoiceFilters { page, size, sort, filter, status?, customerId?, projectId?, dueDateFrom?, dueDateTo? }
├── Response: PaginationEnvelope<Invoice> { data: Invoice[], meta: { page, size, total } }
└── Frontend: Invoice list table → Pagination → Filter/sort UI

GET /v1/invoices/:id
├── Request: None
├── Response: Invoice { id, customerId, projectId, status, totalAmount, dueDate, paidDate, ... }
└── Frontend: Invoice detail page → Edit form → Payment tracking

POST /v1/invoices
├── Request: CreateInvoiceRequest { customerId, projectId?, dueDate, lineItems, ... }
├── Response: Invoice { id, customerId, projectId, status, totalAmount, dueDate, ... }
└── Frontend: Create invoice form → Submit → Redirect to invoice detail

PATCH /v1/invoices/:id
├── Request: UpdateInvoiceRequest { customerId?, projectId?, dueDate?, lineItems?, ... }
├── Response: Invoice { id, customerId, projectId, status, totalAmount, dueDate, ... }
└── Frontend: Edit invoice form → Submit → Update invoice detail
```

### **Time Entry Endpoints**
```
GET /v1/time-entries
├── Request: TimeEntryFilters { page, size, sort, filter, userId?, projectId?, taskId?, status?, billable?, dateFrom?, dateTo? }
├── Response: PaginationEnvelope<TimeEntry> { data: TimeEntry[], meta: { page, size, total } }
└── Frontend: Time entry list table → Pagination → Filter/sort UI

GET /v1/time-entries/:id
├── Request: None
├── Response: TimeEntry { id, userId, projectId, taskId, date, durationHours, description, status, billable, ... }
└── Frontend: Time entry detail page → Edit form

POST /v1/time-entries
├── Request: CreateTimeEntryRequest { userId, projectId, taskId?, date, durationHours, description, billable, ... }
├── Response: TimeEntry { id, userId, projectId, taskId, date, durationHours, description, status, billable, ... }
└── Frontend: Create time entry form → Submit → Redirect to time entry list

PATCH /v1/time-entries/:id
├── Request: UpdateTimeEntryRequest { userId?, projectId?, taskId?, date?, durationHours?, description?, billable?, ... }
├── Response: TimeEntry { id, userId, projectId, taskId, date, durationHours, description, status, billable, ... }
└── Frontend: Edit time entry form → Submit → Update time entry detail
```

## Contract Test Requirements

### **Test Coverage**
- **Users**: CRUD operations with pagination, filtering, sorting
- **Customers**: CRUD operations with pagination, filtering, sorting  
- **Projects**: CRUD operations with pagination, filtering, sorting
- **Quotes**: CRUD operations with pagination, filtering, sorting, status transitions
- **Invoices**: CRUD operations with pagination, filtering, sorting
- **Time Entries**: CRUD operations with pagination, filtering, sorting

### **Test Scenarios**
1. **Pagination**: Test all list endpoints with various page/size combinations
2. **Filtering**: Test all filter parameters work correctly
3. **Sorting**: Test all sort fields and directions
4. **Error Handling**: Test all error scenarios return consistent format
5. **Authentication**: Test Bearer token authentication on all protected endpoints
6. **CORS**: Test preflight requests and credentials handling
7. **Cache Headers**: Test ETag and Cache-Control headers on GET endpoints
8. **Rate Limiting**: Test rate limit headers and enforcement

## Implementation Timeline

### **Week 1: CORS & Authentication**
- Install and configure `@fastify/cors`
- Implement CSRF protection for cookie endpoints
- Update authentication flow to use Bearer tokens
- Test CORS and authentication changes

### **Week 2: Pagination & Error Handling**
- Standardize pagination format across all endpoints
- Implement centralized error handler
- Update SDK types to match new formats
- Test pagination and error handling

### **Week 3: Cache Headers & Testing**
- Implement ETag and Cache-Control headers
- Add rate-limit header exposure
- Create comprehensive contract tests
- Test all endpoints with new contract

### **Week 4: Integration & Validation**
- Frontend integration testing
- Performance testing with cache headers
- Security testing for CSRF protection
- Final validation and documentation

## Success Criteria

### **Technical Requirements**
- ✅ All endpoints use consistent pagination format
- ✅ All errors use standardized envelope format
- ✅ CORS properly configured with `@fastify/cors`
- ✅ Bearer token authentication for all state-changing operations
- ✅ CSRF protection on cookie-protected endpoints
- ✅ ETag and Cache-Control headers on all GET endpoints
- ✅ Rate-limit headers exposed in all responses

### **Quality Requirements**
- ✅ Contract tests pass for all endpoints
- ✅ `pnpm typecheck && pnpm lint && pnpm test && pnpm run qa:forbid` all pass
- ✅ No authentication or CORS regressions
- ✅ Frontend can consume all endpoints with type safety
- ✅ SDK provides complete type coverage

### **Performance Requirements**
- ✅ Cache headers reduce unnecessary requests
- ✅ ETag validation reduces bandwidth usage
- ✅ Rate limiting prevents abuse
- ✅ CORS preflight requests handled efficiently

## Risk Mitigation

### **High Risk Areas**
1. **Authentication Changes**: Risk of breaking existing frontend authentication
   - **Mitigation**: Implement feature flags for gradual rollout
   - **Rollback Plan**: Revert to previous authentication system

2. **Pagination Changes**: Risk of breaking existing frontend pagination
   - **Mitigation**: Maintain backward compatibility during transition
   - **Rollback Plan**: Keep old pagination format as fallback

3. **CORS Changes**: Risk of breaking frontend CORS handling
   - **Mitigation**: Test thoroughly in staging environment
   - **Rollback Plan**: Revert to manual CORS configuration

### **Medium Risk Areas**
1. **Error Format Changes**: Risk of breaking frontend error handling
   - **Mitigation**: Update SDK error handling first
   - **Rollback Plan**: Maintain old error format as fallback

2. **Cache Header Implementation**: Risk of caching issues
   - **Mitigation**: Implement conservative cache policies initially
   - **Rollback Plan**: Remove cache headers if issues arise

## Dependencies

### **External Dependencies**
- `@fastify/cors` plugin installation
- Frontend team coordination for authentication changes
- Staging environment for testing

### **Internal Dependencies**
- SDK package updates
- Contract test suite development
- Documentation updates

## Monitoring & Observability

### **Metrics to Track**
- API response times with cache headers
- CORS preflight request frequency
- Authentication success/failure rates
- Rate limiting trigger frequency
- Error response format consistency

### **Alerts to Configure**
- Authentication failure rate increase
- CORS error rate increase
- Rate limiting trigger rate increase
- Error response format inconsistencies

---

**Status**: 📋 **PLANNING COMPLETE** - Ready for implementation
**Priority**: HIGH - Critical for frontend stability
**Estimated Effort**: 4 weeks
**Dependencies**: None - can start immediately
**Risk Level**: MEDIUM - Well-defined plan with rollback strategies

