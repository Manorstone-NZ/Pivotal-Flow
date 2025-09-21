# Database Naming Convention Rule

## Rule: Database uses snake_case, Application uses camelCase

### Overview

This project follows a consistent naming convention:
- **Database columns**: snake_case (e.g., `rate_card_id`, `quote_line_items`)
- **Application code**: camelCase (e.g., `rateCardId`, `quoteLineItems`)

### Current Implementation Status

#### ✅ Rate Cards (Fully Implemented)
- **Database**: Uses snake_case (`rate_cards`, `rate_card_items`)
- **Schema**: Correctly maps camelCase to snake_case
- **Tests**: All passing

#### ⚠️ Other Tables (Mixed Implementation)
- **Database**: Uses camelCase (`customers`, `quotes`, `users`)
- **Schema**: Matches database exactly
- **Tests**: All passing

### Implementation Strategy

#### Phase 1: Current State (✅ Complete)
- Maintain working system with mixed naming
- Document all column mappings
- Create utility functions for name conversion

#### Phase 2: Gradual Migration (Future)
- Migrate tables one at a time
- Update schema definitions
- Update application code
- Update tests

#### Phase 3: Full Implementation (Future)
- All database columns use snake_case
- All application code uses camelCase
- Consistent mapping throughout

### Usage Guidelines

#### For New Tables
```sql
-- Always use snake_case in database
CREATE TABLE new_feature_flags (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  feature_key VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

```typescript
// Always use camelCase in application code
export const newFeatureFlags = pgTable('new_feature_flags', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  featureKey: varchar('feature_key', { length: 100 }).notNull(),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

#### For Existing Tables
```typescript
// Use the column mapping utility
import { getDbColumnName } from '@/lib/column-mapping';

// In SQL queries
const columnName = getDbColumnName('customers', 'organizationId'); // Returns 'organizationId'
const columnName = getDbColumnName('rateCards', 'organizationId'); // Returns 'organization_id'
```

### Column Mapping Utility

The `column-mapping.ts` utility provides:
- `getDbColumnName(table, field)`: Get database column name
- `getAppFieldName(table, column)`: Get application field name
- `isSnakeCaseTable(table)`: Check if table uses snake_case
- `isCamelCaseTable(table)`: Check if table uses camelCase

### Migration Checklist

When migrating a table from camelCase to snake_case:

1. **Database Migration**
   - [ ] Rename all columns to snake_case
   - [ ] Update all constraint names
   - [ ] Update all index names
   - [ ] Update all foreign key references

2. **Schema Updates**
   - [ ] Update Drizzle schema definitions
   - [ ] Update column mapping utility
   - [ ] Update any raw SQL queries

3. **Application Code**
   - [ ] Update all TypeScript interfaces
   - [ ] Update all service methods
   - [ ] Update all repository methods

4. **Tests**
   - [ ] Update all test data
   - [ ] Update all test assertions
   - [ ] Verify all tests pass

### Best Practices

1. **Consistency**: Always use the same naming convention within a table
2. **Documentation**: Document any exceptions to the rule
3. **Migration**: Plan migrations carefully to avoid downtime
4. **Testing**: Test thoroughly after any naming changes
5. **Backup**: Always backup before migrations

### Current Working State

The system is currently working correctly with:
- **Rate Cards**: Full snake_case implementation ✅
- **Other Tables**: Mixed naming (working correctly) ⚠️
- **Tests**: All passing ✅
- **Documentation**: Complete ✅

### Next Steps

1. **Maintain current state** (working correctly)
2. **Plan gradual migration** (when convenient)
3. **Use snake_case for new tables** (immediate)
4. **Update documentation** (ongoing)
