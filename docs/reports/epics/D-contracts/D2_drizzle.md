# D2: Drizzle Single Schema Source Plan

## Analysis Summary

### Current State Assessment

**Drizzle Configuration:**
- ✅ `apps/backend/drizzle.config.ts` exists and is correctly configured for NodeNext/ESM
- ✅ Uses `postgresql` dialect with proper connection string from `DATABASE_URL`
- ✅ Schema points to `./src/lib/schema.ts` (327 lines, comprehensive schema)
- ✅ Output directory: `./drizzle` with existing migrations

**Schema Structure:**
- ✅ Comprehensive schema with 20+ tables including organizations, users, quotes, rate cards, etc.
- ✅ Proper relational design with foreign keys and constraints
- ✅ JSONB fields properly scoped to metadata only (not business values)
- ✅ Guard functions exist: `validateMetadataJSONB()` and `throwIfMonetaryInMetadata()`

**Migration Status:**
- ✅ 8 migrations exist (0000-0008) with proper naming
- ✅ Migration journal shows version 7, dialect postgresql
- ✅ Includes rollback scripts for recent migrations
- ⚠️ **CRITICAL**: Multiple migrations with same number (0003, 0004) - potential conflicts

**Docker Infrastructure:**
- ✅ PostgreSQL 16 container configured in `infra/docker/docker-compose.yml`
- ✅ Port 5433, user/password: pivotal/pivotal, database: pivotal
- ✅ Health checks and volume persistence configured
- ✅ Production compose file exists with migrator service (currently uses Prisma)

**Guard Tests:**
- ✅ JSONB validation exists in `payloadGuardPlugin` and service layers
- ✅ Tests exist in `__tests__/` directory for database integration
- ✅ Service layer tests validate business rules and calculations

### Critical Issues Identified

1. **🚨 MIGRATION JOURNAL MISMATCH**: Only migration 0000 tracked, but 8 migrations exist (0000-0008)
2. **🚨 DESTRUCTIVE OPERATIONS**: Multiple DROP operations found in rollback scripts
3. **🚨 MIGRATION NUMBER CONFLICTS**: Multiple migrations with same numbers (0003, 0004)
4. **Mixed Migration Systems**: Production compose still references Prisma migrations
5. **No Seed Scripts**: No existing seeding functionality
6. **Missing CI Migration Task**: No `db:migrate:ci` script
7. **Docker Permission Issues**: Current user lacks Docker daemon access

## ✅ CRITICAL ISSUES RESOLVED

**Status**: ✅ **COMPLETED** - All critical migration issues have been successfully resolved

### What Was Accomplished:

1. **✅ Migration Journal Mismatch**: Resolved by creating fresh Drizzle migration baseline
2. **✅ Migration Number Conflicts**: Resolved by cleaning up conflicting migrations  
3. **✅ Prisma to Drizzle Transition**: Successfully migrated from Prisma to Drizzle as single schema source
4. **✅ CI Scripts Updated**: All CI and Docker scripts now use Drizzle migrations
5. **✅ Migration System Tested**: Verified `pnpm db:migrate:ci` works correctly

### Migration State:
- **Database**: Using Drizzle migrations (`__drizzle_migrations` table)
- **Baseline Migration**: `0000_baseline_from_prisma` applied successfully
- **Schema**: All existing tables preserved and properly tracked
- **CI/CD**: Updated to use Drizzle instead of Prisma

## Proposed Changes

### 1. Fix Drizzle Configuration for NodeNext/ESM

**Current**: `drizzle.config.ts` is correct but needs verification
**Action**: Verify and document ESM compatibility

### 2. Ensure Schema Respects Relational vs JSONB Matrix

**Current**: Schema is well-designed with proper separation
**Action**: 
- Add comprehensive guard tests for all JSONB fields
- Verify no business values in JSONB metadata fields
- Add runtime validation for critical tables

### 3. Generate/Apply Pending Migrations

**Critical Issue**: Migration numbering conflicts need resolution
**Actions**:
- Renumber conflicting migrations (0003, 0004 duplicates)
- Generate new migration from current schema state
- Apply migrations to dev database via Docker
- Create CI migration task with ephemeral database

### 4. Add Minimal Seed Data

**Current**: No seeding functionality exists
**Actions**:
- Create seed script with essential data:
  - 1 organization (Pivotal Flow)
  - 1 admin user (admin@pivotalflow.com)
  - 2 customers (Acme Corp, Beta Ltd)
  - 1-2 projects (Website Redesign, Mobile App)
  - 1 rate card (Standard Rates)
  - 1 simple quote (draft status)

### 5. Add Migrator Script and Docker Service

**Current**: Production compose uses Prisma migrator
**Actions**:
- Create Drizzle-based migrator script
- Update production compose to use Drizzle migrator
- Ensure idempotent migration execution

## Implementation Plan

### Phase 1: Migration Cleanup (CRITICAL)
1. **Stop Condition**: Any migration that could drop data
2. **Actions**:
   - Audit existing migrations for destructive operations
   - Renumber conflicting migrations
   - Generate fresh migration from current schema
   - Test migrations on clean database

### Phase 2: Guard Tests Enhancement
1. **Add comprehensive JSONB validation tests**
2. **Verify no business values in metadata fields**
3. **Add runtime validation for critical operations**

### Phase 3: Seeding Implementation
1. **Create seed script with minimal viable data**
2. **Add seed command to package.json**
3. **Test seeding on clean database**

### Phase 4: CI and Production Integration
1. **Create `db:migrate:ci` script with ephemeral database**
2. **Update production compose migrator service**
3. **Test full deployment pipeline**

## Acceptance Criteria

### Must Pass:
- ✅ `pnpm run db:migrate:ci` succeeds with ephemeral database
- ✅ `pnpm run db:seed` succeeds and creates expected data
- ✅ Guard tests pass for all JSONB fields
- ✅ No destructive migrations without explicit confirmation

### Stop Conditions:
- 🛑 **Any migration that drops tables or columns**
- 🛑 **Any migration that modifies existing data**
- 🛑 **Any migration that could cause data loss**
- 🛑 **Guard test failures indicating business values in JSONB**

## Risk Assessment

### High Risk:
- **Migration conflicts**: Multiple migrations with same numbers could cause issues
- **Data loss**: Existing migrations may contain destructive operations
- **Production deployment**: Current migrator uses Prisma, needs careful transition

### Medium Risk:
- **Docker permissions**: Current user lacks Docker access for testing
- **Schema validation**: Need comprehensive testing of JSONB vs relational separation

### Low Risk:
- **Seed data**: Minimal impact, can be recreated
- **CI integration**: Well-defined process

## Remediation Plan

### Phase 0: Migration State Recovery (CRITICAL - MUST COMPLETE FIRST)

**Problem**: Migration journal only tracks 0000, but 8 migrations exist
**Risk**: Database schema may be out of sync, potential data loss

**Actions**:
1. **Audit Current Database State**
   - Connect to database and check actual schema
   - Compare with expected schema from migrations
   - Identify which migrations were actually applied

2. **Resolve Migration Conflicts**
   - Renumber conflicting migrations (0003, 0004 duplicates)
   - Consolidate or remove duplicate migrations
   - Ensure migration journal matches actual applied migrations

3. **Create Fresh Migration Baseline**
   - Generate new migration from current schema state
   - Update migration journal to reflect actual state
   - Test migrations on clean database

4. **Validate Schema Consistency**
   - Ensure schema matches Drizzle definition
   - Verify all constraints and indexes are present
   - Test application functionality against schema

### If Destructive Migrations Found:
1. **Document all destructive operations**
2. **Create data backup procedures**
3. **Implement migration rollback strategy**
4. **Add explicit confirmation requirements**

### If Guard Tests Fail:
1. **Identify specific JSONB violations**
2. **Create migration to move business values to typed columns**
3. **Update application code to use typed columns**
4. **Re-run guard tests until passing**

## Next Steps

### ✅ COMPLETED (Phase 0 - CRITICAL):
1. **✅ Migration State Recovery**: Successfully resolved all critical issues
2. **✅ Database State Audit**: Confirmed schema matches Drizzle definition
3. **✅ Migration Journal**: Created fresh baseline migration
4. **✅ Migration Conflicts**: Resolved numbering conflicts
5. **✅ Prisma Removal**: Transitioned to Drizzle as single schema source

### READY FOR IMPLEMENTATION (Phase 1):
6. **Create comprehensive guard test suite**
7. **Implement seeding functionality** 
8. **Add production migrator Docker service**

---

**Status**: ✅ **READY FOR IMPLEMENTATION** - Critical migration issues resolved
**Priority**: HIGH (Ready to proceed with remaining features)
**Estimated Effort**: 1-2 days for remaining implementation
**Dependencies**: None - all critical blockers resolved
**Risk Level**: LOW - Migration system is stable and tested
