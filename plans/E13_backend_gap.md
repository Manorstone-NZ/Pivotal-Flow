# E13 Backend Gap Analysis & Implementation Plan

## Critical Missing Components

### 1. Customer API Endpoints (Complete Module Missing)

**Missing Module**: `apps/backend/src/modules/customers/`

**Required Endpoints**:
```
GET    /v1/customers              # List customers with filters/pagination
POST   /v1/customers              # Create new customer
GET    /v1/customers/:id          # Get customer by ID
PATCH  /v1/customers/:id          # Update customer
DELETE /v1/customers/:id          # Soft delete customer
```

**Current Status**: ❌ No customer module exists

### 2. Contacts System (Complete Schema & API Missing)

**Missing Schema**: Contacts table not defined in `apps/backend/src/lib/schema.ts`

**Required Contacts Table**:
```sql
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  position VARCHAR(100),
  department VARCHAR(100),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  contact_extras JSONB,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP(3)
);
```

**Required Contact Endpoints**:
```
GET    /v1/customers/:id/contacts           # List customer contacts
POST   /v1/customers/:id/contacts           # Create contact
GET    /v1/customers/:id/contacts/:contactId # Get contact by ID
PATCH  /v1/customers/:id/contacts/:contactId # Update contact
DELETE /v1/customers/:id/contacts/:contactId # Delete contact
```

**Current Status**: ❌ No contacts schema or endpoints exist

### 3. RBAC Permissions (Missing Customer Permissions)

**Missing Permissions** in `apps/backend/src/lib/access-control.ts`:
```typescript
// Customer management permissions
'GET /customers': 'customers.view',
'POST /customers': 'customers.manage',
'GET /customers/:id': 'customers.view',
'PATCH /customers/:id': 'customers.manage',
'DELETE /customers/:id': 'customers.manage',

// Contact management permissions  
'GET /customers/:id/contacts': 'customers.view',
'POST /customers/:id/contacts': 'customers.manage',
'PATCH /customers/:id/contacts/:contactId': 'customers.manage',
'DELETE /customers/:id/contacts/:contactId': 'customers.manage',
```

**Current Status**: ❌ No customer permissions defined

## Minimal D-Patch Implementation Plan

### Phase 1: Database Schema Extension

**File**: `apps/backend/src/lib/schema.ts`

1. **Add Contacts Table**:
```typescript
// Customer contacts table
export const customerContacts = pgTable('customer_contacts', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  position: varchar('position', { length: 100 }),
  department: varchar('department', { length: 100 }),
  isPrimary: boolean('is_primary').notNull().default(false),
  notes: text('notes'),
  contactExtras: jsonb('contact_extras'),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date', precision: 3 }),
}, (table) => ({
  customerIdIdx: index('idx_customer_contacts_customer_id').on(table.customerId),
  organizationIdIdx: index('idx_customer_contacts_organization_id').on(table.organizationId),
  primaryContactIdx: index('idx_customer_contacts_primary').on(table.customerId, table.isPrimary),
}));
```

2. **Add Relations**:
```typescript
export const customersRelations = relations(customers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [customers.organizationId],
    references: [organizations.id],
  }),
  contacts: many(customerContacts),
  projects: many(projects),
  quotes: many(quotes),
}));

export const customerContactsRelations = relations(customerContacts, ({ one }) => ({
  customer: one(customers, {
    fields: [customerContacts.customerId],
    references: [customers.id],
  }),
  organization: one(organizations, {
    fields: [customerContacts.organizationId],
    references: [organizations.id],
  }),
}));
```

3. **Add TypeScript Types**:
```typescript
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type CustomerContact = typeof customerContacts.$inferSelect;
export type NewCustomerContact = typeof customerContacts.$inferInsert;
```

### Phase 2: Customer Module Implementation

**Directory**: `apps/backend/src/modules/customers/`

**Files to Create**:
```
customers/
├── index.ts           # Module exports and route registration
├── routes.ts          # All customer and contact routes
├── service.ts         # Business logic and data access
├── schemas.ts         # Zod validation schemas
└── types.ts          # TypeScript interfaces
```

**Key Implementation Files**:

1. **routes.ts** - All API endpoints with validation
2. **service.ts** - Database operations using Drizzle ORM
3. **schemas.ts** - Request/response validation with Zod
4. **types.ts** - TypeScript interfaces for type safety

### Phase 3: RBAC Integration

**File**: `apps/backend/src/lib/access-control.ts`

Add customer permissions to `ROUTE_PERMISSIONS`:
```typescript
// Customer management
'GET /customers': 'customers.view',
'POST /customers': 'customers.manage',
'GET /customers/:id': 'customers.view',
'PATCH /customers/:id': 'customers.manage',
'DELETE /customers/:id': 'customers.manage',

// Contact management
'GET /customers/:id/contacts': 'customers.view',
'POST /customers/:id/contacts': 'customers.manage',
'PATCH /customers/:id/contacts/:contactId': 'customers.manage',
'DELETE /customers/:id/contacts/:contactId': 'customers.manage',
```

### Phase 4: Route Registration

**File**: `apps/backend/src/routes.ts`

Add customer module registration:
```typescript
import { customerRoutes } from './modules/customers/index.js';

// In registerRoutes():
await app.register(customerRoutes, { prefix: '/api' });
```

## API Specification

### Customer Endpoints

#### GET /v1/customers
**Query Parameters**:
- `page?: number` (default: 1)
- `limit?: number` (default: 20, max: 100)
- `search?: string` (company name, email)
- `status?: 'active' | 'inactive' | 'prospect'`
- `customerType?: 'business' | 'individual'`
- `industry?: string`
- `source?: string`
- `tags?: string[]`

**Response**:
```typescript
{
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

#### POST /v1/customers
**Request Body**:
```typescript
{
  companyName: string;
  legalName?: string;
  industry?: string;
  website?: string;
  description?: string;
  customerType: 'business' | 'individual';
  source?: string;
  tags?: string[];
  // Address fields
  street?: string;
  suburb?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  // Contact fields
  phone?: string;
  email?: string;
}
```

#### GET /v1/customers/:id
**Response**: Single customer object with related data

#### PATCH /v1/customers/:id
**Request Body**: Partial customer update object

### Contact Endpoints

#### GET /v1/customers/:id/contacts
**Response**:
```typescript
{
  success: boolean;
  data: CustomerContact[];
}
```

#### POST /v1/customers/:id/contacts
**Request Body**:
```typescript
{
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
  notes?: string;
}
```

#### PATCH /v1/customers/:id/contacts/:contactId
**Request Body**: Partial contact update object

## Database Migration

**Migration File**: `drizzle/0008_add_customer_contacts.sql`

```sql
-- Add customer contacts table
CREATE TABLE IF NOT EXISTS "customer_contacts" (
  "id" text PRIMARY KEY NOT NULL,
  "customer_id" text NOT NULL,
  "organization_id" text NOT NULL,
  "first_name" varchar(100) NOT NULL,
  "last_name" varchar(100) NOT NULL,
  "email" varchar(255),
  "phone" varchar(20),
  "position" varchar(100),
  "department" varchar(100),
  "is_primary" boolean DEFAULT false NOT NULL,
  "notes" text,
  "contact_extras" jsonb,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp(3) with time zone
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "idx_customer_contacts_customer_id" ON "customer_contacts" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_customer_contacts_organization_id" ON "customer_contacts" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_customer_contacts_primary" ON "customer_contacts" ("customer_id","is_primary");
```

## Validation Schemas

**Zod Schemas for Runtime Validation**:

```typescript
import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  legalName: z.string().max(255).optional(),
  industry: z.string().max(100).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  customerType: z.enum(['business', 'individual']),
  source: z.string().max(50).optional(),
  tags: z.array(z.string()).optional(),
  // Address
  street: z.string().optional(),
  suburb: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  // Contact
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export const CreateContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
});

export const UpdateContactSchema = CreateContactSchema.partial();

export const CustomerQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  customerType: z.enum(['business', 'individual']).optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
```

## Implementation Timeline

### Day 1: Schema & Database
- [ ] Add contacts table to schema
- [ ] Create and run migration
- [ ] Add TypeScript types and relations

### Day 2: Backend Module
- [ ] Create customer module structure
- [ ] Implement service layer with Drizzle queries
- [ ] Add validation schemas

### Day 3: API Routes
- [ ] Implement all customer CRUD endpoints
- [ ] Implement all contact CRUD endpoints
- [ ] Add proper error handling and validation

### Day 4: Security & Testing
- [ ] Add RBAC permissions
- [ ] Register routes in main router
- [ ] Test all endpoints with proper authentication

## Success Criteria

### Backend Completion Checklist
- [ ] All 9 required endpoints implemented and tested
- [ ] Contacts table created with proper relations
- [ ] RBAC permissions configured
- [ ] Zod validation on all inputs
- [ ] Multi-tenant security enforced
- [ ] Error handling and logging implemented
- [ ] Database migrations successful
- [ ] All endpoints return proper OpenAPI-compliant responses

### Quality Gates
- [ ] All existing contract tests remain green
- [ ] New endpoints pass integration tests
- [ ] Proper HTTP status codes and error messages
- [ ] Authentication and authorization working
- [ ] Database queries optimized with proper indexes

---

**Next Step**: Begin backend implementation starting with database schema extension, then proceed with customer module creation.

**Estimated Effort**: 4-5 days for complete backend implementation before frontend development can begin.
