# Compatibility Shims Documentation

## Overview

This document lists the compatibility shims created during CZ1 to resolve missing module and import path errors. These shims provide temporary compatibility bridges while maintaining the existing API contracts.

## Shims Created

### 1. Audit Logger Shim
**File**: `apps/backend/src/modules/audit/logger.ts`
**Purpose**: Provides audit logging functionality when shared audit logger is not available
**API**: 
- `auditLog(event: AuditEvent): Promise<void>`
- `AuditLogger` interface
- `AuditEvent` interface

**Future Removal**: Replace with proper shared audit logger implementation in CZ2

### 2. Xero Configuration Shim
**File**: `apps/backend/src/config/xero_config.ts`
**Purpose**: Provides typed Xero configuration with environment variable validation
**API**:
- `getXeroConfig(): XeroConfig`
- `isXeroConfigured(): boolean`
- `XeroConfig` interface

**Future Removal**: Enhance with proper validation in CZ2

### 3. Xero No-Op Connector
**File**: `packages/integrations/xero/src/no-op-connector.ts`
**Purpose**: Provides stub implementations for Xero integration methods
**API**:
- `NoOpXeroConnector` class
- `pushInvoice()`, `pushPayment()`, `pullContact()`, `pullAccountCodes()` methods

**Future Removal**: Replace with real Xero API integration in C track

### 4. bcrypt Compatibility Shim
**File**: `packages/shared/security/bcrypt-compat.ts`
**Purpose**: Provides bcrypt API compatibility using argon2 for better security
**API**:
- `hash(data: string, saltRounds?: number): Promise<string>`
- `compare(data: string, encrypted: string): Promise<boolean>`

**Future Removal**: Keep as permanent replacement for bcrypt (better security)

### 5. Cache Compatibility Shim
**File**: `apps/backend/src/lib/cache.ts`
**Purpose**: Provides cache functionality when shared Redis wrapper is not available
**API**:
- `getCache(): CacheAdapter`
- `CacheAdapter` interface with `get()`, `set()`, `del()`, `health()` methods

**Future Removal**: Replace with proper shared Redis wrapper in CZ2

### 6. App Compatibility Bridge
**File**: `apps/backend/app.js`
**Purpose**: Provides compatibility bridge for legacy app imports
**API**:
- Re-exports `build` function from main bootstrap

**Future Removal**: Remove when all legacy imports are updated

## TypeScript Path Mappings

**File**: `tsconfig.base.json`
**Added Paths**:
- `"bcrypt": ["packages/shared/security/bcrypt-compat.ts"]`
- `"@shared/*": ["packages/shared/*"]`
- `"@integrations/xero/*": ["packages/integrations/xero/*"]`

**Future Removal**: Keep bcrypt mapping, remove others when proper imports are established

## Import Path Fixes

### Files Updated:
- `apps/backend/src/files/routes.ts`
- `apps/backend/src/files/service.ts`
- `apps/backend/src/modules/integrations/xero/index.ts`
- `apps/backend/src/modules/portal/__tests__/routes.test.ts`
- `apps/backend/src/modules/reference-data/routes.ts`
- `apps/backend/src/modules/reference-data/service.ts`

### Changes Made:
- Removed `.js` suffixes from imports pointing to TypeScript files
- Updated to use shim paths instead of missing modules
- Fixed relative import paths

## Removal Timeline

### CZ2 (Environment Validation)
- Enhance Xero config with proper validation
- Replace cache shim with proper Redis wrapper
- Enhance audit logger with proper shared implementation

### CZ3 (Authentication Hardening)
- Remove app compatibility bridge
- Update all legacy imports

### C Track (Future)
- Replace Xero no-op connector with real API integration
- Keep bcrypt compatibility shim (permanent improvement)

## Testing

All shims have been tested to ensure:
- TypeScript compilation succeeds
- No missing module errors (TS2307)
- API contracts maintained
- No runtime errors introduced

## Notes

- Shims are designed to be minimal and focused
- No business logic changes were made
- All shims maintain existing API contracts
- Future removal is planned and documented
- Security improvements (argon2 over bcrypt) are permanent

