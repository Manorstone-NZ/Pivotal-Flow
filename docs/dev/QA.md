# QA Scripts

This document describes the QA scripts used to maintain code quality and consistency in the Pivotal Flow project.

## Prisma Forbidden Check

### Purpose
The `scripts/qa/forbid_prisma.ts` script ensures that no Prisma references remain in the codebase after migrating to Drizzle ORM.

### What it checks
- **Source files**: TypeScript/JavaScript files for Prisma imports and usage
- **Package files**: package.json files for Prisma dependencies
- **Documentation**: Markdown files for Prisma references (with exceptions for migration docs)

### Usage
```bash
# Run locally
npx tsx scripts/qa/forbid_prisma.ts

# Run in CI (add to package.json scripts)
"qa:forbid-prisma": "tsx scripts/qa/forbid_prisma.ts"
```

### CI Integration
Add to your CI workflow:
```yaml
- name: Check for Prisma violations
  run: npm run qa:forbid-prisma
```

### Violation Types
1. **Import violations**: `import { PrismaClient } from '@prisma/client'`
2. **Usage violations**: `prisma.user.findMany()` or `PrismaClient`
3. **Reference violations**: Prisma mentions in documentation (except migration docs)

### Exceptions
The script allows Prisma references in:
- Migration documentation (contains "CF0" or "ORM alignment")
- Historical documentation about the migration process

### Fixing Violations
1. Replace Prisma imports with Drizzle imports
2. Update database queries to use Drizzle syntax
3. Remove Prisma dependencies from package.json
4. Update documentation to reference Drizzle only
5. Use the repository layer pattern for data access

## DTO Smoke Test

### Purpose
The `scripts/dev-tools/dto_smoke_test.ts` script verifies that customer and user DTOs return the expected fields.

### What it tests
- **Customer DTOs**: id, email, displayName, isActive, organizationId
- **User DTOs**: id, email, displayName, isActive, organizationId, roles

### Usage
```bash
# Run locally
npx tsx scripts/dev-tools/dto_smoke_test.ts
```

### Expected Output
```
🚀 Starting DTO smoke tests...

🧪 Testing Customer DTOs...
✅ Found 3 customers
✅ Customer DTO structure is correct
📋 Sample customer: {
  id: "cust_001",
  email: "contact@acme.com",
  displayName: "ACME Corporation",
  isActive: true,
  organizationId: "org_test"
}

🧪 Testing User DTOs...
✅ Found 5 users
✅ User DTO structure is correct
📋 Sample user: {
  id: "user_001",
  email: "john.doe@example.com",
  displayName: "John Doe",
  isActive: true,
  organizationId: "org_test",
  roles: []
}

✅ All DTO tests passed!
```

## Type Checking

### Purpose
Ensure TypeScript compilation works across the entire workspace.

### Usage
```bash
# Run type checking
pnpm typecheck

# Or individually
pnpm --filter=backend typecheck
pnpm --filter=frontend typecheck
pnpm --filter=shared typecheck
pnpm --filter=sdk typecheck
```

### What it checks
- TypeScript compilation errors
- Missing type definitions
- Import/export mismatches
- Schema type alignment

## Testing

### Purpose
Run all tests to ensure functionality works correctly.

### Usage
```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter=backend test
pnpm --filter=frontend test
pnpm --filter=shared test
pnpm --filter=sdk test
```

### Test Coverage
- Unit tests for individual functions
- Integration tests for database operations
- Repository pattern tests
- DTO structure validation

## CI Integration

### GitHub Actions
Add these steps to your CI workflow:

```yaml
- name: Check for Prisma violations
  run: npm run qa:forbid-prisma

- name: Type check
  run: pnpm typecheck

- name: Run tests
  run: pnpm test

- name: DTO smoke test
  run: npx tsx scripts/dev-tools/dto_smoke_test.ts
```

### Pre-commit Hooks
Consider adding these checks to pre-commit hooks:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run qa:forbid-prisma && pnpm typecheck"
    }
  }
}
```

## Troubleshooting

### Prisma Violations Found
1. Check the violation report for specific files and lines
2. Replace Prisma imports with Drizzle equivalents
3. Update database queries to use Drizzle syntax
4. Remove Prisma dependencies from package.json
5. Update documentation to reference Drizzle only

### DTO Test Failures
1. Check that repository DTOs expose only the required fields
2. Verify that displayName is used instead of name
3. Ensure isActive is properly computed from status
4. Check that organizationId is included in all DTOs

### Type Check Failures
1. Fix TypeScript compilation errors
2. Add missing type definitions
3. Resolve import/export mismatches
4. Update schema types to match actual database schema

## Best Practices

### Repository Pattern
- Use DTOs to expose only required fields
- Keep database queries in repository classes
- Use proper typing for all database operations
- Implement pagination and filtering consistently

### DTO Design
- Expose only: id, email, displayName, isActive, organizationId
- Use displayName instead of name for users and customers
- Include roles array for user DTOs
- Keep DTOs simple and focused

### Database Access
- Use Drizzle ORM exclusively
- No direct Prisma imports or usage
- Use repository pattern for data access
- Implement proper error handling

### Documentation
- Keep documentation up to date with current technology stack
- Reference Drizzle instead of Prisma
- Document migration processes and decisions
- Maintain clear examples and usage patterns
