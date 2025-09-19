# E13 — Customers & Contacts Management Analysis

## Current Backend State Assessment

### ✅ Database Schema Analysis
**Customers Table Exists**: `apps/backend/src/lib/schema.ts` line 225-254
- ✅ Complete customer schema with normalized fields
- ✅ Organization-based multi-tenancy support
- ✅ Comprehensive address and contact fields
- ✅ Status, type, source, tags, rating fields
- ✅ Audit timestamps (created/updated/deleted)
- ✅ JSONB contactExtras for flexible data

### ❌ Critical Backend Gaps Identified

**Missing Customer API Endpoints**: No customer module found in `apps/backend/src/modules/`
- ❌ `GET /v1/customers` (list with filters/pagination)
- ❌ `POST /v1/customers` (create customer)
- ❌ `GET /v1/customers/:id` (get by ID)
- ❌ `PATCH /v1/customers/:id` (update customer)

**Missing Contacts System**: No dedicated contacts table or endpoints
- ❌ No contacts table in schema
- ❌ `GET /v1/customers/:id/contacts` (list customer contacts)
- ❌ `POST /v1/customers/:id/contacts` (create contact)
- ❌ `PATCH /v1/customers/:id/contacts/:contactId` (update contact)

**Missing RBAC Permissions**: No customer permissions in access control
- ❌ `customers.view` permission not defined
- ❌ `customers.manage` permission not defined
- ❌ Route permissions not mapped in `ROUTE_PERMISSIONS`

### ⚠️ STOP CONDITION TRIGGERED
According to requirements: "If any endpoint missing or schema drift: STOP, create plans/E13_backend_gap.md"

## Frontend Requirements Analysis

### Routes to Implement
- `/customers` - Customer list with search, filters, pagination
- `/customers/:id` - Customer detail page with tabs (Details | Contacts | Projects)

### API Integration Strategy
- Use generated SDK + zod runtime validation
- Implement React Query hooks for caching and state management
- Follow relational vs JSONB matrix (no totals/prices in customer data)

### Component Architecture
```
src/pages/Customers/
├── List.tsx           # Main customer list page
└── Details.tsx        # Customer detail page with tabs

src/components/customers/
├── CustomerTable.tsx  # Sortable table with row actions
├── CustomerForm.tsx   # Zod schema-based form
├── ContactList.tsx    # Customer contacts display
└── ContactForm.tsx    # Contact creation/editing
```

### UX & Accessibility Requirements
- **Search & Filters**: Name, email, status, created date
- **Table Features**: Sortable headers, row actions, pagination
- **Permission Gating**: "New Customer" button requires `customers.manage`
- **Inline Editing**: Core fields editable in detail view
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and live regions
- **Form Validation**: Real-time validation with error announcements

### Performance Requirements
- **Bundle Size**: Route ≤ 50KB gzipped
- **Code Splitting**: Lazy load pages and heavy components
- **Data Loading**: Efficient pagination and filtering
- **Caching**: React Query for optimistic updates

### Testing Strategy
- **RTL Unit Tests**: Form validation, table sorting, filtering
- **Playwright E2E**: Full customer creation and management workflow
- **Accessibility**: Axe testing for critical a11y issues
- **Contract Tests**: Ensure OP7 compatibility maintained

## Data Model Analysis

### Customer Schema (Existing)
```typescript
interface Customer {
  id: string;
  organizationId: string;
  customerNumber: string;        // Auto-generated unique number
  companyName: string;          // Required
  legalName?: string;
  industry?: string;
  website?: string;
  description?: string;
  status: 'active' | 'inactive' | 'prospect';
  customerType: 'business' | 'individual';
  source?: string;              // Lead source
  tags?: string[];              // Categorization
  rating?: number;              // 1-5 star rating
  
  // Address (normalized)
  street?: string;
  suburb?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  
  // Contact (normalized)
  phone?: string;
  email?: string;
  contactExtras?: any;          // Social links, etc.
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Contacts Schema (To Be Created)
```typescript
interface Contact {
  id: string;
  customerId: string;           // FK to customers
  organizationId: string;       // For multi-tenancy
  firstName: string;            // Required
  lastName: string;             // Required
  email?: string;
  phone?: string;
  position?: string;            // Job title
  department?: string;
  isPrimary: boolean;           // Primary contact flag
  notes?: string;
  contactExtras?: any;          // Social profiles, etc.
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Validation Rules (Zod Schemas)
```typescript
const CustomerSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(255),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  status: z.enum(['active', 'inactive', 'prospect']),
  customerType: z.enum(['business', 'individual']),
  // ... other fields
});

const ContactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/).optional().or(z.literal("")),
  position: z.string().max(100).optional(),
  isPrimary: z.boolean(),
  // ... other fields
});
```

## Implementation Plan

### Phase 1: Backend Gap Resolution
1. **Create Backend Module**: `apps/backend/src/modules/customers/`
2. **Add Contacts Schema**: Extend database schema with contacts table
3. **Implement API Routes**: All required CRUD endpoints
4. **Add RBAC Permissions**: Customer view/manage permissions
5. **Update Route Registration**: Register customer routes in main router

### Phase 2: Frontend Implementation
1. **Create API Hooks**: Typed React Query hooks with zod validation
2. **Build Components**: Reusable customer and contact components
3. **Implement Pages**: List and detail pages with proper routing
4. **Add Storybook Stories**: Component documentation and testing
5. **Implement Tests**: Unit and e2e test coverage

### Phase 3: Quality Assurance
1. **Accessibility Testing**: Axe compliance and keyboard navigation
2. **Performance Testing**: Bundle size and loading performance
3. **Browser Testing**: Dev and Docker environment verification
4. **Contract Testing**: Ensure existing tests remain green

## Risk Assessment

### High Risk
- **Backend Dependencies**: Must implement complete backend before frontend
- **Schema Changes**: Database migrations required for contacts table
- **Permission System**: RBAC integration complexity

### Medium Risk
- **Performance**: Large customer datasets may require virtualization
- **UX Complexity**: Inline editing and contact management interactions

### Low Risk
- **Component Reusability**: Can leverage existing patterns from other modules
- **Testing Infrastructure**: Existing test setup can be extended

## Success Criteria

### Functional
- ✅ Full CRUD operations for customers and contacts
- ✅ Search, filter, and pagination working
- ✅ Permission-based access control
- ✅ Inline editing and form validation

### Technical
- ✅ Route bundle ≤ 50KB gzipped
- ✅ No critical accessibility issues
- ✅ All contract tests green
- ✅ Browser visibility in dev and Docker

### User Experience
- ✅ Responsive design across devices
- ✅ Keyboard navigation support
- ✅ Clear error handling and feedback
- ✅ Intuitive customer and contact management workflow

## Next Steps

1. **IMMEDIATE**: Create `plans/E13_backend_gap.md` with detailed backend implementation plan
2. **Backend Implementation**: Complete all missing API endpoints and schema
3. **Frontend Development**: Begin with API hooks and component library
4. **Integration Testing**: End-to-end workflow validation
5. **Documentation**: Complete implementation report with screenshots

---

**Status**: Analysis Complete - Backend gaps identified, requires backend implementation before frontend development can proceed.
