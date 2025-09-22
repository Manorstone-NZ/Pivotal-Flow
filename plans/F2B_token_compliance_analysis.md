# F2B Token Compliance Analysis

## Executive Summary

**Current State**: The application currently uses a mixed authentication model with JWT tokens in many places, despite having some PASETO v4 infrastructure. This violates our security policy requirements.

**Target State**: Complete migration to opaque session tokens (15-min TTL) for end-user sessions and PASETO v4 for service-to-service and public links.

**Critical Issues Identified**:
1. JWT verification still active in `plugin.auth.js` (line 159: `await request.jwtVerify()`)
2. Frontend uses `localStorage` for token storage instead of secure cookies
3. 657+ instances of Bearer token usage across the codebase
4. OpenAPI schema defines `bearerAuth` with JWT format
5. No sessions table for opaque token storage
6. No CSRF protection for cookie-based auth

## Detailed Analysis

### A. Backend JWT Usage

#### 1. Authentication Plugin (`apps/backend/src/modules/auth/plugin.auth.js`)
**Issues**:
- Line 159: `await request.jwtVerify()` - JWT verification still active
- Line 2: JWT import commented out but logic remains
- Lines 160-214: JWT payload processing logic
- No opaque session verification implemented

**Required Changes**:
- Remove `request.jwtVerify()` call
- Replace with `verifySession` preHandler
- Implement session cookie reading and validation
- Add RLS context setting

#### 2. Route Files Using `fastify.authenticate`
**Files Affected**:
- `apps/backend/src/modules/rate-cards/f2Routes.ts` (line 40)
- `apps/backend/src/modules/reference-data/routes.js` (lines 59, 78, 115, 147)
- `apps/backend/src/modules/portal/routes.js` (multiple lines)
- `apps/backend/src/modules/integrations/xero/index.js` (line 112)
- `apps/backend/src/files/routes.js` (lines 62, 89, 179, 216, 241)
- `apps/backend/src/modules/organizations/routes.js` (multiple lines)
- `apps/backend/src/modules/customers/routes.js` (line 27)
- `apps/backend/src/modules/permissions/routes.js` (multiple lines)

**Required Changes**:
- Replace `fastify.authenticate` with `fastify.verifySession`
- Update all route preHandlers
- Remove JWT-related authentication logic

#### 3. OpenAPI Security Schemes
**File**: `apps/backend/src/lib/openapi-schema.js`
**Issues**:
- Lines 86-91: `bearerAuth` scheme with JWT format
- Multiple route definitions use `{ bearerAuth: [] }` security

**Required Changes**:
- Replace `bearerAuth` with `cookieAuth` for staff UI
- Add `pasetoPublic` for service-to-service
- Update all route security definitions
- Regenerate SDK types

### B. Frontend JWT Usage

#### 1. Token Storage (`apps/frontend/src/lib/api.ts`)
**Issues**:
- Lines 14, 29: `localStorage.getItem('accessToken')` and `localStorage.setItem('accessToken')`
- Lines 17, 30: Refresh token handling in localStorage

**Required Changes**:
- Remove all localStorage token storage
- Rely on HttpOnly cookies for authentication
- Update API client to use `credentials: 'include'`

#### 2. Bearer Token Usage in API Calls
**Files Affected**:
- `apps/frontend/src/pages/Quotes/Details.tsx` (line 435)
- `apps/frontend/src/pages/Time/Approvals.tsx` (line 118)
- `apps/frontend/src/lib/api-client.ts` (line 48)
- `apps/frontend/src/features/quotes/delivery.api.ts` (line 95)
- `apps/frontend/src/features/tenancy/api.ts` (line 160)
- `apps/frontend/src/features/time/api.ts` (line 107)
- `apps/frontend/src/features/approvals/api.ts` (line 94)
- `apps/frontend/src/lib/api/client.ts` (line 30)

**Required Changes**:
- Remove all `Authorization: Bearer ${token}` headers
- Ensure all fetch calls use `credentials: 'include'`
- Add CSRF token handling for mutations

#### 3. Auth Store (`apps/frontend/src/features/auth/store.ts`)
**Current State**: Already partially migrated to opaque tokens
**Issues**:
- Still stores sessionId in localStorage (line 92)
- No CSRF token handling

**Required Changes**:
- Remove sessionId from localStorage
- Add CSRF token management
- Ensure all API calls use cookies only

### C. Test Files

#### 1. Backend Tests
**Files Affected**:
- `apps/backend/src/__tests__/setup.js` (line 5): `import jwt from 'jsonwebtoken'`
- Multiple test files use `Authorization: Bearer ${token}` pattern
- Integration tests expect JWT tokens

**Required Changes**:
- Remove JWT imports and usage
- Update tests to use session cookies
- Create session-based test helpers

#### 2. Frontend Tests
**Files Affected**:
- `apps/frontend/tests/contracts/api-contracts.test.ts`: Bearer token usage
- Playwright tests expect JWT authentication

**Required Changes**:
- Update contract tests for cookie-based auth
- Modify Playwright tests for opaque sessions

### D. SDK and Generated Code

#### 1. SDK Package (`packages/sdk/`)
**Issues**:
- Lines 51, 62: Bearer token handling in generated client
- Lines 113, 155: Bearer token in enhanced generator script
- TypeScript types expect Bearer tokens

**Required Changes**:
- Regenerate SDK with new security schemes
- Remove Bearer token logic from client
- Update TypeScript types

## Implementation Plan

### Phase 1: Database Schema (Priority: Critical)
1. **Create sessions table**:
   ```sql
   CREATE TABLE sessions (
     id UUID PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id),
     tenant_id TEXT NOT NULL REFERENCES tenants(id),
     expires_at TIMESTAMP NOT NULL,
     revoked_at TIMESTAMP,
     ip_hash TEXT,
     ua_hash TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Create service_keys table**:
   ```sql
   CREATE TABLE service_keys (
     id TEXT PRIMARY KEY, -- kid
     purpose TEXT NOT NULL, -- 'paseto-public' | 'paseto-local'
     material TEXT NOT NULL, -- encrypted key material
     created_at TIMESTAMP DEFAULT NOW(),
     rotates_at TIMESTAMP,
     revoked_at TIMESTAMP
   );
   ```

3. **Add indexes and constraints**

### Phase 2: Backend Authentication (Priority: Critical)
1. **Implement session verification**:
   - `verifySession` preHandler
   - `verifyPaseto` for S2S
   - `verifyPublicPaseto` for public links

2. **Remove JWT verification**:
   - Replace `request.jwtVerify()` with session lookup
   - Update all route preHandlers
   - Remove JWT payload processing

3. **Add CSRF protection**:
   - CSRF token endpoint
   - Double-submit cookie validation
   - Security headers middleware

### Phase 3: Frontend Migration (Priority: High)
1. **Remove Bearer token usage**:
   - Update all API calls to use cookies
   - Remove localStorage token storage
   - Add CSRF token handling

2. **Update auth store**:
   - Remove sessionId from localStorage
   - Ensure cookie-only authentication
   - Add CSRF token management

### Phase 4: API Surface Updates (Priority: High)
1. **Update OpenAPI schema**:
   - Replace bearerAuth with cookieAuth
   - Add pasetoPublic scheme
   - Update all route security definitions

2. **Regenerate SDK**:
   - Update client with new security schemes
   - Remove Bearer token logic
   - Update TypeScript types

### Phase 5: Testing (Priority: Medium)
1. **Update test suites**:
   - Replace JWT mocks with session mocks
   - Update integration tests
   - Modify Playwright tests

2. **Add compliance tests**:
   - Session cookie validation
   - PASETO token verification
   - CSRF protection tests
   - Cross-tenant isolation tests

## Risk Assessment

### High Risk
- **Authentication bypass**: Current JWT verification could allow unauthorized access
- **Token leakage**: localStorage tokens vulnerable to XSS attacks
- **Cross-tenant access**: No proper session-based tenant isolation

### Medium Risk
- **Test failures**: Extensive test updates required
- **SDK compatibility**: Breaking changes for API consumers
- **Performance impact**: Session lookups vs JWT verification

### Low Risk
- **User experience**: Minimal impact on end users
- **Deployment complexity**: Well-defined migration path

## Success Criteria

1. **No JWT verification remains** in application code
2. **All staff UI requests** use opaque cookie sessions
3. **Public portal and S2S calls** use PASETO v4 tokens only
4. **Tenant context** is server-derived from sessions/tokens
5. **CSRF protection** enforced on cookie-backed mutations
6. **Zero TypeScript errors** after SDK regeneration
7. **All tests pass** with new authentication model

## Estimated Effort

- **Database migrations**: 4 hours
- **Backend auth implementation**: 16 hours
- **Frontend migration**: 12 hours
- **API surface updates**: 8 hours
- **Testing updates**: 12 hours
- **Total**: ~52 hours

## Next Steps

1. Create database migrations for sessions and service_keys tables
2. Implement session verification preHandlers
3. Remove JWT verification from auth plugin
4. Update all route preHandlers
5. Migrate frontend to cookie-based authentication
6. Update OpenAPI schema and regenerate SDK
7. Update test suites
8. Validate compliance with security policies

