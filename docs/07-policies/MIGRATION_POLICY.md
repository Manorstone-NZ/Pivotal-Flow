# Migration Policy

## Overview

This document defines the migration policy for Pivotal Flow, ensuring safe database migrations with proper rollback capabilities and CI validation.

## Migration System

### Technology Stack
- **ORM**: Drizzle ORM
- **Migration Tool**: Drizzle Kit
- **Database**: PostgreSQL
- **CI**: GitHub Actions with ephemeral databases

### Migration Naming Convention
```
{sequence}_{description}.sql
{sequence}_{description}_rollback.sql
```

Example:
- `0004_quote_performance_indexes.sql`
- `0004_quote_performance_indexes_rollback.sql`

## Migration Requirements

### 1. Rollback Scripts
**Every migration must have a corresponding rollback script** that:
- Reverses all changes made by the migration
- Uses `DROP IF EXISTS` for safety
- Includes comments explaining what is being rolled back
- Is tested in CI before deployment

### 2. Migration Content
- **Descriptive comments** explaining the purpose and date
- **Atomic operations** that can be safely rolled back
- **Performance considerations** for large tables
- **Data validation** where appropriate

### 3. Index Migrations
- **Composite indexes** for common query patterns
- **GIN indexes** for JSONB fields that are queried
- **Partial indexes** for soft deletes and status filters
- **Rollback scripts** that drop all created indexes

## CI Migration Process

### Migration Test Job
The CI runs a comprehensive migration test that:

1. **Fresh Database Setup**
   - Creates a new PostgreSQL database
   - Applies all existing migrations
   - Validates schema state

2. **Apply New Migration**
   - Applies the new migration
   - Validates schema changes
   - Checks for any errors

3. **Rollback Test**
   - Runs the rollback script
   - Validates schema is back to previous state
   - Confirms no data loss

4. **Re-apply Test**
   - Applies the migration again
   - Validates final schema state
   - Ensures consistency

### Drift Detection
- **Schema comparison** between migration state and Prisma schema
- **Automatic failure** if schema differs from expected state
- **Detailed reporting** of any drift detected

## Migration Run Order

### Pre-Migration
1. **Environment Check**: Ensure `./scripts/docker/check-env.sh` passes
2. **Backup**: Create database backup (for production)
3. **Validation**: Run migration in test environment

### Migration Execution
1. **Apply Migration**: Run the forward migration
2. **Validate**: Check schema and data integrity
3. **Test Rollback**: Verify rollback script works
4. **Re-apply**: Apply migration again to ensure consistency

### Post-Migration
1. **Schema Validation**: Ensure schema matches expected state
2. **Performance Check**: Verify indexes and constraints
3. **Application Test**: Run application tests against new schema

## Rollback Practice

### Rollback Script Requirements
```sql
-- Rollback Migration: {description}
-- Date: {date}
-- Purpose: Rollback changes from {migration_name}

-- Remove indexes
DROP INDEX IF EXISTS index_name;

-- Remove tables
DROP TABLE IF EXISTS table_name CASCADE;

-- Remove columns
ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;

-- Remove constraints
ALTER TABLE table_name DROP CONSTRAINT IF EXISTS constraint_name;
```

### Rollback Testing
1. **Automated Testing**: CI automatically tests rollback scripts
2. **Manual Validation**: Test rollback on development copy
3. **Documentation**: Document any manual steps required

## B and C Track Migrations

### B Track Migrations (Business Features)
- Resource allocations
- Customer portal users
- Export jobs
- Performance indexes

### C Track Migrations (Infrastructure)
- CI/CD improvements
- Schema optimizations
- Security enhancements

### Rollback Scripts Required
All B and C track migrations must include rollback scripts:
- `0004_add_resource_allocations_table.sql` → `0004_add_resource_allocations_table_rollback.sql`
- `0006_add_customer_portal_users.sql` → `0006_add_customer_portal_users_rollback.sql`
- `0007_add_export_jobs.sql` → `0007_add_export_jobs_rollback.sql`

## Migration Commands

### Development
```bash
# Generate new migration
pnpm --filter @pivotal-flow/backend drizzle:generate

# Apply migrations locally
ALLOW_LOCAL_DB_CREATION=yes pnpm --filter @pivotal-flow/backend drizzle:migrate

# Test rollback locally
./scripts/dev/test-migration-rollback.sh
```

### CI/CD
```bash
# CI migration test
./scripts/ci/test-migrations.sh

# Production migration
pnpm --filter @pivotal-flow/backend drizzle:migrate
```

## Safety Guidelines

### Never Do
- **Skip rollback scripts** - Every migration must be reversible
- **Modify existing migrations** - Create new migrations instead
- **Ignore CI failures** - Fix migration issues before proceeding
- **Deploy without testing** - Always test in staging first

### Always Do
- **Test rollback scripts** - Verify they work before deployment
- **Document changes** - Include clear comments and purpose
- **Consider performance** - Add appropriate indexes
- **Validate data** - Ensure data integrity after migration

## Emergency Procedures

### Rollback Production Migration
1. **Stop application** to prevent new data
2. **Run rollback script** to reverse changes
3. **Validate schema** matches previous state
4. **Restart application** with previous version
5. **Investigate** migration failure
6. **Fix and test** before re-deploying

### Data Recovery
1. **Restore from backup** if rollback fails
2. **Manual data correction** if needed
3. **Document incident** for future reference
4. **Update rollback scripts** based on lessons learned

## Monitoring and Validation

### Migration Monitoring
- **Execution time** tracking for performance
- **Error logging** for debugging
- **Schema validation** post-migration
- **Application health** checks

### Validation Checks
- **Schema consistency** with Prisma state
- **Index performance** verification
- **Constraint validation** testing
- **Data integrity** checks

## Best Practices

### Migration Development
1. **Start with schema changes** in development
2. **Test thoroughly** before committing
3. **Include rollback scripts** from the start
4. **Document purpose** and impact

### Migration Deployment
1. **Use CI pipeline** for testing
2. **Deploy during low traffic** periods
3. **Monitor closely** during migration
4. **Have rollback plan** ready

### Migration Maintenance
1. **Regular cleanup** of old migrations
2. **Performance review** of indexes
3. **Documentation updates** as needed
4. **Process improvements** based on experience
