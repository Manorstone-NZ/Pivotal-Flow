# F1.5 Cross-Stack Bug-Swat & Hardening Analysis

**Document Type**: Quality Assurance - Stability Analysis  
**Moved From**: `/plans/F1_5_stability_analysis.md`  
**Date**: January 2025

**Date**: 2025-01-27  
**Agent**: Stability & Security Agent  
**Scope**: Authentication, Tenancy, TypeScript Debt, and Test Stabilization  

## Executive Summary

This analysis identifies critical security vulnerabilities, architectural inconsistencies, and technical debt across the Pivotal Flow application. The current system has significant gaps in authentication security, improper frontend tenant switching, and extensive TypeScript compilation issues that must be addressed systematically.

**Priority**: P0 (Critical) - Security vulnerabilities and compilation failures  
**Estimated Effort**: 2-3 weeks of focused development  
**Risk Level**: High - Multiple security and stability issues  

## Current State Assessment

### 🔴 Critical Issues (P0)

#### 1. Authentication Security Vulnerabilities
- **Current System**: JWT with HS256, basic password hashing
- **Issues**:
  - No Argon2id password hashing (using basic bcrypt/unspecified)
  - No OPAQUE PAKE for registration/login flows
  - No PASETO tokens (still using JWT)
  - No proper session management with revocation
  - No refresh token rotation or reuse detection
  - Missing device fingerprinting and IP binding

#### 2. Frontend Tenant Switching (Security Risk)
- **Location**: `apps/frontend/src/components/tenancy/TenantSwitcher.tsx`
- **Issues**:
  - Client-side tenant switching in header component
  - No server-side authorization for tenant changes
  - No audit trail for tenant switches
  - Allows unauthorized access to different tenant data
  - Violates principle of server-enforced tenancy

#### 3. TypeScript Compilation Failures
- **Current Count**: 502 compilation errors
- **Impact**: Blocks deployment, CI/CD pipeline failures
- **Root Causes**:
  - Missing type definitions
  - Implicit `any` types throughout codebase
  - Non-null assertions (`!`) without proper guards
  - Outdated generics and interface mismatches

### 🟡 High Priority Issues (P1)

#### 4. Database Schema Inconsistencies
- **Missing Tables**: `sessions`, `public_tokens`, `public_rate_limits`, `public_token_audit`
- **Missing Constraints**: NOT NULL on tenant_id, foreign keys, unique constraints
- **Missing Indexes**: Performance-critical queries lack proper indexing
- **Migration Issues**: No idempotent migrations for security updates

#### 5. API Schema Validation Gaps
- **Missing TypeBox Schemas**: Many routes lack proper request/response validation
- **Error Envelope Inconsistency**: No standardized error format
- **Unknown Props**: AJV not configured to reject unknown properties
- **Rate Limiting**: Inconsistent or missing rate limits on auth/public endpoints

#### 6. Test Failures and Coverage Gaps
- **Failing Tests**: 8+ test suites failing
- **MSW Issues**: Request handlers not properly configured
- **Integration Test Failures**: Database and API functionality tests failing
- **Missing Test Coverage**: No tenancy isolation tests, no auth flow tests

### 🟢 Medium Priority Issues (P2)

#### 7. Frontend Performance and UX
- **Bundle Size**: No bundle budget enforcement
- **Accessibility**: Storybook a11y issues not addressed
- **React Query**: Cache keys don't include tenantId
- **Optimistic Updates**: Money-related data uses optimistic updates (security risk)

#### 8. Observability Gaps
- **Frontend OTEL**: No tenantId attributes in telemetry
- **Backend Metrics**: Missing tenant_id labels on metrics
- **Alerting**: No alerts for auth failures or 4xx spikes on public routes

## Detailed Error Analysis

### TypeScript Error Breakdown
```
TS2339 (163 errors): Property does not exist on type
TS6133 (62 errors):  Variable is declared but never used  
TS2345 (53 errors):  Argument type not assignable to parameter
TS18048 (45 errors): Possibly undefined
TS2554 (41 errors):  Expected N arguments, but got M
TS4111 (29 errors):  Property comes from index signature
TS18046 (25 errors): Possibly null
TS2304 (16 errors):  Cannot find name
TS6196 (10 errors):  All imports unused
TS7006 (9 errors):   Parameter has implicit 'any' type
```

### Authentication System Analysis
- **Token Management**: `apps/backend/src/modules/auth/tokens.ts` - Basic JWT implementation
- **Password Hashing**: `apps/backend/src/modules/auth/service.drizzle.ts` - Uses `verifyPassword()` but algorithm unknown
- **Session Management**: No dedicated sessions table, no revocation mechanism
- **Refresh Tokens**: Basic implementation without rotation or reuse detection

### Frontend Tenant Switching Analysis
- **Component**: `TenantSwitcher.tsx` allows client-side tenant switching
- **API Integration**: Uses `apiClient.setTenantId()` for client-side tenant changes
- **Security Risk**: No server-side validation of tenant access permissions
- **Audit Gap**: No logging of tenant switches

## Implementation Plan

### Phase 1: Critical Security (Week 1)
1. **Database Schema Updates**
   - Add sessions, public_tokens, rate_limits, audit tables
   - Add constraints and indexes
   - Create migration scripts

2. **Remove Frontend Tenant Switching**
   - Delete TenantSwitcher component
   - Remove from Header
   - Update API client to remove tenant switching methods

3. **TypeScript Compilation Fixes**
   - Fix top 200 most critical errors
   - Enable strict compiler settings
   - Remove implicit `any` types

### Phase 2: Authentication Overhaul (Week 2)
1. **Argon2id Password Hashing**
   - Implement Argon2id with strong parameters
   - Create migration path for existing passwords
   - Add password strength validation

2. **OPAQUE PAKE Implementation**
   - Implement register/login start/finish flows
   - Server-side OPRF record storage
   - Client-side password handling

3. **PASETO Token System**
   - Replace JWT with PASETO v4
   - Implement access token (v4.public) and refresh token (v4.local)
   - Add token rotation and revocation

### Phase 3: API & Testing (Week 3)
1. **API Schema Standardization**
   - Add TypeBox schemas to all routes
   - Implement standardized error envelopes
   - Add rate limiting to auth/public endpoints

2. **Test Coverage**
   - Fix failing test suites
   - Add tenancy isolation tests
   - Add auth flow integration tests
   - Add Playwright e2e tests

3. **Observability & Performance**
   - Add tenantId to FE OTEL events
   - Add tenant_id labels to BE metrics
   - Set up alerting for auth failures
   - Implement bundle size budgets

## Success Criteria

### Technical Metrics
- [ ] TypeScript compilation: 0 errors
- [ ] ESLint: 0 errors
- [ ] Test coverage: >90% for auth flows
- [ ] Bundle size: ≤50KB gz per route
- [ ] Performance: p95 latency <600ms

### Security Metrics
- [ ] No frontend tenant switching
- [ ] Argon2id password hashing implemented
- [ ] OPAQUE PAKE flows operational
- [ ] PASETO tokens with rotation
- [ ] Session revocation working
- [ ] Rate limiting on all auth/public endpoints

### Functional Metrics
- [ ] All existing functionality preserved
- [ ] Admin "Assume Tenant" working
- [ ] Public portal token security enforced
- [ ] Audit logging for all tenant changes
- [ ] Error envelopes standardized

## Next Steps

1. **Immediate**: Begin Phase 1 implementation
2. **Daily**: Progress tracking and risk assessment
3. **Weekly**: Stakeholder updates and milestone reviews
4. **Final**: Comprehensive security audit and penetration testing

---

**Note**: This analysis represents a critical security and stability overhaul. The current system has significant vulnerabilities that must be addressed before production deployment. The proposed solution provides a robust, secure foundation for the Pivotal Flow application.