# F1A Tenant Admin Portal Analysis

**Document Type**: Implementation Analysis  
**Moved From**: `/plans/F1A_tenant_admin_portal_analysis.md`  
**Date**: January 2025

## Overview
This document analyzes the requirements and design for implementing a Tenant Admin Portal that allows platform administrators to manage tenants, memberships, and tenant lifecycle operations without implementing tenant switching functionality.

## UX Map

### Admin Portal Routes
- `/admin/tenants` - Tenant list with search, pagination, and actions
- `/admin/tenants/:id` - Tenant details with Settings and Users tabs

### User Journey
1. Platform admin authenticates with `system.super_admin` permission
2. Access admin portal section in navigation
3. View paginated tenant list with search capabilities
4. Create new tenants with validation
5. Edit tenant details (name, slug, billing_email, etc.)
6. Manage tenant memberships (add/remove users, assign roles)
7. Suspend/reactivate tenants as needed

### UI Components Required
- `TenantListTable` - Paginated table with search and actions
- `TenantForm` - Create/edit tenant form with validation
- `MembershipTable` - User membership management
- `RoleBadge` - Visual role indicators
- `SuspendDialog` - Confirmation dialog for suspend/reactivate

## API Contracts (TypeBox)

### Tenant Schemas
```typescript
// Create Tenant Schema
export const CreateTenantSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  slug: Type.String({ 
    minLength: 1, 
    maxLength: 100, 
    pattern: '^[a-z0-9-]+$' 
  }),
  billingEmail: Type.String({ format: 'email' }),
  defaultCurrency: Type.String({ 
    minLength: 3, 
    maxLength: 3, 
    pattern: '^[A-Z]{3}$',
    default: 'USD' 
  }),
  timezone: Type.String({ default: 'UTC' })
}, { additionalProperties: false });

// Update Tenant Schema
export const UpdateTenantSchema = Type.Partial(Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  slug: Type.String({ 
    minLength: 1, 
    maxLength: 100, 
    pattern: '^[a-z0-9-]+$' 
  }),
  billingEmail: Type.String({ format: 'email' }),
  defaultCurrency: Type.String({ 
    minLength: 3, 
    maxLength: 3, 
    pattern: '^[A-Z]{3}$' 
  }),
  timezone: Type.String(),
  status: Type.Union([
    Type.Literal('ACTIVE'),
    Type.Literal('SUSPENDED')
  ])
}), { additionalProperties: false });

// Membership Schema
export const CreateMembershipSchema = Type.Object({
  userEmail: Type.String({ format: 'email' }),
  role: Type.Union([
    Type.Literal('OWNER'),
    Type.Literal('ADMIN'),
    Type.Literal('STAFF'),
    Type.Literal('VIEWER')
  ])
}, { additionalProperties: false });
```

### API Endpoints
- `GET /v1/admin/tenants` - List tenants with pagination/search
- `POST /v1/admin/tenants` - Create new tenant
- `GET /v1/admin/tenants/:id` - Get tenant details
- `PATCH /v1/admin/tenants/:id` - Update tenant
- `POST /v1/admin/tenants/:id/users` - Add user membership
- `DELETE /v1/admin/tenants/:id/users/:membershipId` - Remove membership

### Response Schemas
```typescript
export const TenantResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  slug: Type.String(),
  billingEmail: Type.String(),
  defaultCurrency: Type.String(),
  timezone: Type.String(),
  status: Type.Union([
    Type.Literal('ACTIVE'),
    Type.Literal('SUSPENDED')
  ]),
  createdAt: Type.String(),
  membershipCount: Type.Number()
});

export const MembershipResponseSchema = Type.Object({
  id: Type.String(),
  userEmail: Type.String(),
  role: Type.String(),
  createdAt: Type.String()
});
```

## DB Migrations (Drizzle)

### New Tables
```sql
-- Tenants table
CREATE TABLE "tenants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "billing_email" text NOT NULL,
  "default_currency" text(3) NOT NULL DEFAULT 'USD',
  "timezone" text NOT NULL DEFAULT 'UTC',
  "status" text NOT NULL DEFAULT 'ACTIVE' 
    CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  "created_at" timestamptz DEFAULT now() NOT NULL
);

-- Memberships table
CREATE TABLE "memberships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "role" text NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'STAFF', 'VIEWER')),
  "created_at" timestamptz DEFAULT now() NOT NULL,
  UNIQUE("user_id", "tenant_id")
);

-- Indexes
CREATE INDEX "idx_memberships_tenant_role" ON "memberships"("tenant_id", "role");
CREATE INDEX "idx_tenants_status" ON "tenants"("status");
CREATE INDEX "idx_tenants_slug" ON "tenants"("slug");
```

### Drizzle Schema Definitions
```typescript
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  billingEmail: text('billing_email').notNull(),
  defaultCurrency: text('default_currency', { length: 3 }).notNull().default('USD'),
  timezone: text('timezone').notNull().default('UTC'),
  status: text('status').notNull().default('ACTIVE').$type<'ACTIVE' | 'SUSPENDED'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  role: text('role').notNull().$type<'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueMembership: uniqueIndex('memberships_user_tenant_unique').on(table.userId, table.tenantId),
  tenantRoleIdx: index('idx_memberships_tenant_role').on(table.tenantId, table.role),
}));
```

## RLS Impact

### Platform Admin Access
- Tenant admin routes are platform-scoped, not tenant-scoped
- No RLS policies applied to `tenants` and `memberships` tables for admin routes
- Access controlled via `system.super_admin` permission in route middleware
- Existing domain tables maintain their RLS policies unchanged

### Security Considerations
- Admin routes isolated from tenant-scoped data access
- No cross-tenant data exposure risk for admin operations
- Rate limiting applied per platform admin user
- Structured error responses without sensitive data leakage

## Frontend Test Plan

### Unit Tests (React Testing Library)
- Component rendering with various props
- Form validation and submission
- User interaction handling (clicks, inputs)
- Error state handling
- Loading state management

### Integration Tests (Playwright E2E)
- Full tenant creation workflow
- Membership management operations
- Search and pagination functionality
- Suspend/reactivate tenant operations
- Error handling and validation messages

### Accessibility Tests
- Keyboard navigation (tab/shift+tab)
- Screen reader compatibility
- Focus management in modals
- Color contrast compliance
- ARIA labels and roles

### Performance Tests
- Lighthouse CI budgets:
  - p75 LCP < 2.5s
  - Total JS < 180KB
  - Main thread < 2s
- Visual regression snapshots
- Network request monitoring

### Quality Gates
- No console errors/warnings
- No 4xx/5xx responses on page loads
- Axe accessibility checks pass
- Build warnings treated as errors
- Route chunk size < 50KB gzipped

## Implementation Phases

### Phase 1: Backend Foundation
1. Create Drizzle migration for tenants/memberships tables
2. Implement TypeBox schemas and validation
3. Create Fastify routes with proper permissions
4. Add backend unit and integration tests

### Phase 2: Frontend Components
1. Build core UI components with Storybook
2. Implement tenant list and detail pages
3. Add form handling and validation
4. Create membership management interface

### Phase 3: E2E Integration
1. Set up Playwright test suite
2. Implement accessibility checks
3. Add performance monitoring
4. Configure CI/CD pipeline gates

### Phase 4: Quality Assurance
1. Run comprehensive test suite
2. Validate security and permissions
3. Performance optimization
4. Documentation updates

## Success Criteria
- All admin portal routes functional and accessible
- Create/edit/suspend tenant operations working
- Membership management fully operational
- No tenant switching UI or functionality implemented
- All CI gates passing (tests, accessibility, performance)
- Zero cross-tenant data leakage
- Platform admin permissions properly enforced
