# Database Naming Convention Implementation Plan

## Rule: Database uses snake_case, Application uses camelCase

### Current State Analysis

The database currently has an inconsistent naming convention:
- **Rate card tables** (`rate_cards`, `rate_card_items`): ✅ Already use snake_case
- **Business tables** (`customers`, `quotes`, `quote_line_items`, `projects`): ❌ Use camelCase
- **User table**: ❌ Mixed (camelCase with some snake_case fields)
- **Service categories**: ❌ Mixed (camelCase with `is_visible` in snake_case)

### Implementation Strategy

#### Phase 1: Update Drizzle Schema (Immediate)
1. ✅ **Rate Cards**: Already correctly using snake_case in schema
2. ✅ **Customers**: Schema matches current database (camelCase)
3. ✅ **Quotes**: Schema matches current database (camelCase)
4. ✅ **Users**: Schema matches current database (camelCase)
5. ✅ **Service Categories**: Schema matches current database (camelCase)

#### Phase 2: Database Migration (Future)
Create a comprehensive migration script that:
1. Renames all camelCase columns to snake_case
2. Updates all constraint names to snake_case
3. Updates all index names to snake_case
4. Updates all foreign key references

#### Phase 3: Application Code Updates (Future)
1. Update all SQL queries to use snake_case column names
2. Update all Drizzle schema definitions to use snake_case
3. Update all test data to use snake_case column names

### Current Working State

The system is currently working correctly with:
- **Database**: Mixed naming (snake_case for rate cards, camelCase for others)
- **Drizzle Schema**: Matches database exactly
- **Application Code**: Uses camelCase in TypeScript
- **Tests**: All passing

### Next Steps

1. **Document the current state** ✅
2. **Create migration scripts** for future use
3. **Update application code** to handle both naming conventions
4. **Plan gradual migration** to full snake_case

### Migration Scripts Created

- `migrate-to-snake-case.sql`: Comprehensive migration (needs refinement)
- `migrate-to-snake-case-fixed.sql`: Partial migration (constraint issues)

### Recommendation

For now, maintain the current working state and implement the naming convention rule gradually:

1. **New tables**: Always use snake_case
2. **Existing tables**: Migrate when convenient
3. **Application code**: Use camelCase in TypeScript
4. **Drizzle schema**: Match database exactly (mixed for now)
