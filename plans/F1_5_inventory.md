# F1.5 Cross-Stack Bug-Swat & Hardening - Inventory Analysis

## Overview
This document provides a comprehensive inventory of bugs, contract drift, and security/performance risks identified in the Pivotal Flow codebase as part of the F1.5 stability hardening initiative.

## Bugs (Observed/Triaged)

### P0 - Critical Issues (Must Fix Before F2)

#### 1. Console.log Statements in Production Code
**Priority:** P0  
**Impact:** Security risk, performance degradation, unprofessional output  
**Files Affected:** 20+ files across backend and frontend  
**Description:** Multiple console.log statements found in production code, violating the strict TypeScript policy.

**Affected Files:**
- `apps/backend/src/lib/db.js:83` - Database query error logging
- `apps/backend/src/lib/db.ts:96` - Database query error logging  
- `apps/frontend/src/features/auth/store.ts:57,61,70,73,123,134,137,169,171,174,179,192,207,208` - Authentication flow logging
- `apps/frontend/src/components/layout/Header.tsx:30` - Logout error logging
- Multiple files in `scripts/dev-tools/` - Development logging
- Various service files with console.error statements

**Repro Steps:**
1. Run any backend operation that triggers database errors
2. Perform frontend authentication operations
3. Check browser console and server logs

#### 2. Missing Tenant Scoping in Database Queries
**Priority:** P0  
**Impact:** Data leakage between tenants, security vulnerability  
**Description:** Several service classes lack proper tenant scoping enforcement in database queries.

**Affected Areas:**
- `AllocationService.getAllocations()` - No tenant_id filtering in WHERE clauses
- `BaseRepository.scopeToOrganization()` - Uses `organizationId` instead of `tenantId`
- Multiple service classes extending BaseRepository without tenant validation

**Repro Steps:**
1. Create user in Tenant A
2. Switch to Tenant B context
3. Query allocations - should return empty, but may return Tenant A data

#### 3. Public Token Replay Vulnerability
**Priority:** P0  
**Impact:** Security breach, unauthorized approvals  
**Description:** Public approval tokens lack replay protection and usage tracking.

**Missing Features:**
- No `used_at` field in approval tokens
- No transactional accept/reject with token status validation
- No rate limiting on public approval endpoints
- No structured audit logging for public token usage

### P1 - High Priority Issues

#### 4. TypeBox vs Zod Validation Inconsistency
**Priority:** P1  
**Impact:** API contract drift, validation failures  
**Description:** Mixed usage of Zod and TypeBox validation schemas across the codebase.

**Affected Areas:**
- `packages/shared/src/validation.ts` - Uses Zod schemas
- Backend routes lack TypeBox schemas for request/response validation
- No standardized error envelope format

#### 5. Database Schema Missing Constraints
**Priority:** P1  
**Impact:** Data integrity issues, performance problems  
**Description:** Missing NOT NULL constraints, foreign keys, and indexes.

**Missing Constraints:**
- No UNIQUE constraint on `(user_id, tenant_id)` in user memberships
- Missing NOT NULL on critical `tenant_id` columns
- No indexes on `(tenant_id, created_at)` for high-volume tables
- Missing foreign key constraints on several relationships

#### 6. React Query Cache Key Issues
**Priority:** P1  
**Impact:** Stale data, incorrect cache invalidation  
**Description:** Cache keys don't include tenantId, causing cross-tenant cache pollution.

**Affected Areas:**
- `apps/frontend/src/lib/api/queries.ts` - Cache keys lack tenant scoping
- Organization switching doesn't properly invalidate caches
- No tenant-aware cache key structure

### P2 - Medium Priority Issues

#### 7. Missing Security Headers
**Priority:** P2  
**Impact:** Security vulnerabilities  
**Description:** Missing CSP, frame-ancestors, and other security headers.

#### 8. Performance Issues
**Priority:** P2  
**Impact:** Slow response times, poor user experience  
**Description:** Potential N+1 queries and missing pagination limits.

## Contract Drift (SDK vs API)

### 1. Validation Schema Mismatch
**Issue:** Frontend uses Zod schemas while backend should use TypeBox  
**Impact:** Runtime validation failures  
**Files:** `packages/shared/src/validation.ts` vs backend route schemas

### 2. Error Response Format Inconsistency
**Issue:** No standardized error envelope format  
**Current:** Mixed error formats across endpoints  
**Expected:** `{ error: { code, message, details? } }` format

### 3. API Response Schema Missing
**Issue:** Backend routes lack TypeBox response schemas  
**Impact:** No compile-time type safety for API responses  
**Files:** All backend route files missing schema definitions

## Security/Performance Risks

### P0 - Critical Security Risks

#### 1. Cross-Tenant Data Leakage
**Risk Level:** Critical  
**Description:** Database queries without tenant scoping can return data from other tenants  
**Affected Queries:** Multiple service classes with missing tenant_id filters

#### 2. Public Token Replay Attacks
**Risk Level:** Critical  
**Description:** Public approval tokens can be reused multiple times  
**Missing:** Token usage tracking, one-time enforcement, rate limiting

### P1 - High Security Risks

#### 3. Missing Rate Limiting
**Risk Level:** High  
**Description:** Public endpoints lack rate limiting  
**Affected:** `/api/public/*` routes, authentication endpoints

#### 4. Insufficient Audit Logging
**Risk Level:** High  
**Description:** Public token usage not properly audited  
**Missing:** IP tracking, user agent logging, action tracking

### P2 - Medium Security Risks

#### 5. Missing Security Headers
**Risk Level:** Medium  
**Description:** CSP, frame-ancestors, and other headers missing  
**Impact:** XSS protection, clickjacking prevention

#### 6. Console.log Information Disclosure
**Risk Level:** Medium  
**Description:** Debug information logged to console in production  
**Impact:** Information disclosure, performance degradation

### Performance Risks

#### 1. N+1 Query Problems
**Risk Level:** High  
**Description:** Potential N+1 queries in hot endpoints  
**Affected:** Quotes, projects, invoices endpoints

#### 2. Missing Database Indexes
**Risk Level:** High  
**Description:** No indexes on `(tenant_id, created_at)` for high-volume tables  
**Impact:** Slow queries, table scans

#### 3. Missing Pagination Limits
**Risk Level:** Medium  
**Description:** No maximum limits on pagination  
**Impact:** Full-table scans, memory issues

#### 4. Bundle Size Issues
**Risk Level:** Medium  
**Description:** No bundle size monitoring or limits  
**Impact:** Slow page loads, poor user experience

## Next Steps

### Immediate Actions (P0)
1. Remove all console.log statements from production code
2. Implement tenant scoping in all database queries
3. Add public token replay protection

### Short-term Actions (P1)
1. Standardize on TypeBox validation schemas
2. Add missing database constraints and indexes
3. Fix React Query cache key structure

### Long-term Actions (P2)
1. Implement comprehensive security headers
2. Add performance monitoring and optimization
3. Create comprehensive test coverage

## Risk Assessment Summary

- **P0 Issues:** 3 critical issues requiring immediate attention
- **P1 Issues:** 3 high-priority issues affecting security and performance  
- **P2 Issues:** 4 medium-priority issues for hardening

**Overall Risk Level:** High - Multiple critical security vulnerabilities and data integrity issues require immediate remediation before F2 release.
