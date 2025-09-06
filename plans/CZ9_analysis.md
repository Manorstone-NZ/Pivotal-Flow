# CZ9 Shared Code Type Safety Analysis

## Current State Assessment

### Violation Inventory

**Total Violations in Scope**: 34
- **Any Types**: 34 instances
- **Non-null Assertions**: 0 instances

**Scope**: `packages/shared/**` and `apps/backend/src/lib/**`

### Files with Violations

#### apps/backend/src/lib/audit-schema.ts
- **Lines**: 28, 47, 77, 78, 79, 80
- **Types**: Function parameters and return types using `any`
- **Classification**: Domain object shapes known - audit data structures

#### apps/backend/src/lib/cache.ts
- **Lines**: 7
- **Types**: Variable declaration `let sharedCache: any = null`
- **Classification**: Generic util that can be typed with proper interface

#### apps/backend/src/lib/cors-rate-limit.d.ts
- **Lines**: 113
- **Types**: `allowList: any`
- **Classification**: Domain object shape known - CORS configuration

#### apps/backend/src/lib/idempotency.ts
- **Lines**: 17, 54, 55, 56, 80, 81, 82, 83, 130, 131, 132, 133, 172, 271
- **Types**: Function parameters, return types, middleware signatures
- **Classification**: Generic util that can be typed with proper interfaces

### Classification Analysis

#### 1. Truly Unknown Payload from Third Party
- **None identified** - All `any` types are for internal data structures

#### 2. Domain Object Shape Known
- **audit-schema.ts**: Audit log data, old/new values, metadata
- **cors-rate-limit.d.ts**: CORS allow list configuration
- **idempotency.ts**: Request/response data structures

#### 3. Generic Util That Can Be Typed with Generics
- **cache.ts**: Cache service interface
- **idempotency.ts**: Middleware and storage interfaces

## Planned Changes

### A. Strict Helpers
**File**: `packages/shared/utils/strict.ts`
```typescript
export function required<T>(v: T | null | undefined, msg: string): T
export function toNull(v: string | null | undefined): string | null
export function isNonEmptyString(v: unknown): v is string
```

### B. ID and Time Utils
**File**: `packages/shared/utils/id.ts`
```typescript
export function generateId(): string
```

**File**: `packages/shared/utils/time.ts`
```typescript
export function startTimer(): () => number
export function nowIso(): string
```

### C. Audit Types and Logger
**File**: `packages/shared/types/audit.ts`
```typescript
export type AuditAction = "created" | "updated" | "deleted" | "approved" | "rejected" | "payment_applied" | "payment_voided"
export interface AuditEvent {
  actorId: string | null
  organisationId: string
  entityType: string
  entityId: string
  action: AuditAction
  metadata?: Record<string, unknown>
  createdAt?: Date
}
```

**File**: `packages/shared/audit/logger.ts`
```typescript
export interface AuditLogger {
  log(event: AuditEvent): Promise<void>
}
```

**File**: `packages/shared/audit/normalise.ts`
```typescript
export const auditUserId = (id: string | null | undefined): string | null => id ?? null
```

### D. Permissions
**File**: `packages/shared/security/permissions.ts`
```typescript
export interface PermissionChecker {
  has(permission: string): boolean
}

export class PermissionService implements PermissionChecker {
  constructor(
    private readonly userId: string,
    private readonly organisationId: string,
    private readonly roles: ReadonlyArray<string> = []
  ) {}
  
  has(permission: string): boolean
}
```

### E. Token Manager Types
**File**: `packages/shared/security/tokenManager.ts`
```typescript
export type TokenKind = "access" | "refresh"

export interface TokenRecord {
  jti: string
  userId: string
  organisationId: string
  kind: TokenKind
  expiresAt: number
}

export interface KeyValue {
  get(key: string): Promise<string | null>
  set(key: string, value: string, mode?: string, ttl?: number): Promise<unknown>
  del(key: string): Promise<unknown>
}

export class TokenManager {
  constructor(store: KeyValue, refreshTtlSeconds: number)
  // typed methods: setRefresh, getRefresh, rotateRefresh, revokeRefresh
}
```

### F. Cache Wrapper
**File**: `apps/backend/src/lib/cache.ts`
```typescript
export interface CacheService {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  health(): Promise<boolean>
}
```

### G. Shared Index Barrel
**File**: `packages/shared/index.ts`
```typescript
// Re-export public types and helpers
export * from './utils/strict'
export * from './utils/id'
export * from './utils/time'
export * from './types/audit'
export * from './audit/logger'
export * from './audit/normalise'
export * from './security/permissions'
export * from './security/tokenManager'
```

## Implementation Strategy

### Phase 1: Create Foundation Types
1. Create strict helpers
2. Create ID and time utils
3. Create audit types and logger
4. Create permissions interface
5. Create token manager types

### Phase 2: Fix Backend Lib Files
1. Fix audit-schema.ts with proper audit types
2. Fix cache.ts with proper cache interface
3. Fix cors-rate-limit.d.ts with proper CORS types
4. Fix idempotency.ts with proper request/response types

### Phase 3: Update Shared Barrel
1. Update packages/shared/index.ts with all exports

### Phase 4: Verification
1. Run pnpm run qa:forbid to verify zero violations in scope
2. Run pnpm typecheck to verify no new errors
3. Run pnpm lint and pnpm test to verify no regressions

## Expected Outcomes

- **Zero `any` types** in packages/shared and apps/backend/src/lib
- **Zero non-null assertions** in scope
- **Precise types** for all shared utilities
- **Clean exports** for downstream consumption
- **No behavior changes** - only type safety improvements

## Risk Assessment

**Low Risk**: All changes are type-only with no runtime behavior changes.

**Mitigation**:
- Use `unknown` at boundaries then narrow with type guards
- Maintain existing function signatures where possible
- Use precise Record types instead of loose index signatures
- Test each change incrementally
