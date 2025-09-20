# E14 — Tenancy (Organization) Creation & Administration Analysis

## Current Backend State Assessment

### ✅ Database Schema Analysis
**Organizations Table Exists**: `apps/backend/src/lib/schema.ts` lines 48-78
- ✅ Complete organization schema with normalized fields
- ✅ Multi-tenant structure with organization ID references
- ✅ Comprehensive address fields (street, suburb, city, region, postcode, country)
- ✅ Contact fields (phone, email, website)
- ✅ Business fields (name, slug, domain, industry, size, tax_id)
- ✅ Subscription management (plan, status, trial_ends_at)
- ✅ Settings JSONB field for feature-specific configurations
- ✅ Audit timestamps (created_at, updated_at, deleted_at)
- ✅ Contact extras JSONB for social links and secondary channels

**Organization Security Policies Table**: `orgSecurityPolicies` exists
- ✅ Typed security settings separate from JSONB
- ✅ Follows matrix rules for stable vs flexible data

### ❌ Critical Backend Gaps Identified

**Missing Organization API Endpoints**: No organization module found in `apps/backend/src/modules/`
- ❌ `GET /v1/organizations` (list organizations)
- ❌ `POST /v1/organizations` (create organization/tenant)
- ❌ `GET /v1/organizations/:id` (get organization by ID)
- ❌ `PATCH /v1/organizations/:id` (update organization details)
- ❌ `POST /v1/organizations/:id/invite-user` (invite user to organization)
- ❌ `GET /v1/organizations/:id/settings` (get organization settings)
- ❌ `POST /v1/organizations/:id/settings` (update organization settings)

**Missing RBAC Permissions**: No organization permissions in access control
- ❌ `orgs.manage` permission not defined in `ROUTE_PERMISSIONS`
- ❌ `orgs.view` permission not defined
- ❌ Admin-only access controls not implemented

**Missing User-Organization Relationship Management**:
- ❌ No invite user functionality
- ❌ No role assignment within organizations
- ❌ No user listing per organization

### ⚠️ STOP CONDITION TRIGGERED
According to requirements: "If backend lacks any endpoint/shape, STOP and open a schema PR"

**Required Backend Implementation**:
1. **Organization Module**: Complete CRUD operations
2. **User Invitation System**: Email-based invites with role assignment
3. **Settings Management**: Typed settings with JSONB for feature flags
4. **RBAC Extensions**: Organization management permissions

## Frontend Requirements Analysis

### Routes to Implement
- `/admin/tenants` - Organization list (admin only)
- `/admin/tenants/new` - Create organization wizard (3 steps)
- `/admin/tenants/:id` - Organization detail page with tabs

### Multi-Tenant Switching Requirements
- **Header TenantSwitcher.tsx**: Combobox for organization switching
- **Tenant Context**: Persist selected organization
- **App Refetch**: Trigger full app data refresh on tenant switch
- **Backend Integration**: Respect tenant guard headers

### API Integration Strategy
- Use generated SDK + TypeBox runtime validation (not Zod as specified)
- Implement React Query hooks for organization management
- Follow relational vs JSONB matrix rules
- Enforce string/UUID/address schema validation

### Component Architecture
```
src/pages/Tenancy/
├── List.tsx           # Organization list page (admin only)
├── New.tsx            # 3-step organization creation wizard
└── Details.tsx        # Organization details with tabs

src/components/tenancy/
├── OrganizationForm.tsx    # Core organization form
├── AddressFields.tsx       # Reusable address form component
├── SettingsEditor.tsx      # Typed settings management
├── InviteUserModal.tsx     # User invitation modal
└── TenantSwitcher.tsx      # Header tenant switching component

src/features/tenancy/
└── api.ts             # Organization API hooks
```

### UI/UX Requirements

#### Organization Creation Wizard (3 Steps):
1. **Step 1 - Core Info**: 
   - Organization name (required)
   - Organization code/slug (auto-generated, editable)
   - Domain (optional)
   - Industry (dropdown)
   - Size (dropdown)

2. **Step 2 - Address**: 
   - Street address
   - Suburb/District
   - City
   - Region/State
   - Postcode/ZIP
   - Country (dropdown)

3. **Step 3 - Defaults**: 
   - Default currency (dropdown)
   - Timezone (dropdown)
   - Feature flags (checkboxes)
   - Success: Option to "Invite first user"

#### Organization Details Tabs:
1. **Overview**: 
   - Core fields (inline editable)
   - Address card display
   - Subscription info
   - Audit timestamps

2. **Settings**: 
   - Security policies (typed table)
   - Notification preferences (typed table)
   - Feature flags (JSONB)
   - Effective policy preview
   - Last updated audit stamps

3. **Users & Roles**: 
   - Invite user (email + role selection)
   - User list with roles
   - Role assignment management
   - Remove/modify user access

### Accessibility & Performance Requirements
- **A11y**: Table semantics, form labeling, keyboard navigation
- **Performance**: Route chunks ≤ 50KB gzipped
- **CSRF**: Attach CSRF headers for mutations
- **Validation**: Strict TypeScript, no `any`, no `!`, no console logs

### Multi-Tenant Switching UX
- **Header Component**: Dropdown/combobox in main header
- **Organization List**: Show user's accessible organizations
- **Persistence**: Remember selected organization
- **Context Refresh**: Trigger app-wide data refresh on switch
- **Domain Lock**: Display domain restrictions if applicable

## Current Frontend State

### ✅ Existing Infrastructure
- ✅ **Authentication System**: Login, permissions, RBAC working
- ✅ **Router Setup**: React Router with lazy loading
- ✅ **API Client**: Axios-based with TypeBox validation
- ✅ **UI Components**: Dialog, Form, Table components available
- ✅ **State Management**: Zustand auth store, React Query

### ❌ Missing Frontend Components
- ❌ **Tenancy Routes**: No `/admin/tenants` routes
- ❌ **Organization Components**: No organization management UI
- ❌ **Tenant Switcher**: No multi-tenant switching in header
- ❌ **Admin Navigation**: No admin-only navigation items
- ❌ **Organization API**: No tenancy API hooks

## Implementation Strategy

### Phase 1: Backend Gap Resolution
**STOP CONDITION**: Must implement backend organization endpoints first
1. Create `apps/backend/src/modules/organizations/` module
2. Implement CRUD operations for organizations
3. Add user invitation system
4. Implement settings management
5. Add RBAC permissions for organization management

### Phase 2: Frontend Implementation (After Backend Complete)
1. **Routes & Navigation**: Admin tenancy routes
2. **API Client**: Organization management hooks
3. **Wizard Components**: 3-step organization creation
4. **Detail Pages**: Organization management interface
5. **Tenant Switcher**: Multi-tenant header component
6. **Tests**: RTL unit tests and Playwright E2E
7. **Documentation**: Tenancy flow documentation

## Risk Assessment

### 🔴 **High Risk - Backend Dependencies**
- **Missing API Endpoints**: Complete organization API module needed
- **User Management Integration**: Invite system requires user module updates
- **Permission System**: New RBAC permissions required

### 🟡 **Medium Risk - Frontend Complexity**
- **Multi-Tenant Context**: Complex state management for tenant switching
- **Wizard UX**: 3-step form with validation and state persistence
- **Admin-Only UI**: Conditional rendering based on permissions

### 🟢 **Low Risk - Infrastructure Ready**
- **UI Components**: Existing Dialog, Form, Table components can be reused
- **Authentication**: RBAC system already supports permission checks
- **Database Schema**: Organizations table already properly designed

## Next Steps

1. **🛑 STOP**: Cannot proceed with frontend until backend gaps are resolved
2. **Backend PR Required**: Organization module with full CRUD operations
3. **Schema Migration**: May need additional tables for user invitations
4. **OpenAPI Update**: Generate new SDK after backend implementation
5. **Frontend Implementation**: Begin after backend endpoints are available

## Acceptance Criteria Checklist

### Backend Prerequisites
- [ ] Organization CRUD endpoints implemented
- [ ] User invitation system working
- [ ] Settings management with typed tables + JSONB
- [ ] RBAC permissions for `orgs.manage`
- [ ] OpenAPI documentation updated
- [ ] SDK regenerated with new endpoints

### Frontend Deliverables
- [ ] Admin tenancy routes (`/admin/tenants/*`)
- [ ] Organization creation wizard (3 steps)
- [ ] Organization detail management
- [ ] Multi-tenant switcher in header
- [ ] Storybook stories for all components
- [ ] RTL unit tests for forms and flows
- [ ] Playwright E2E smoke tests
- [ ] Accessibility audit (Axe)
- [ ] Performance budget compliance (≤ 50KB gz)
- [ ] Documentation updates

### Quality Gates
- [ ] Contract tests green (no API drift)
- [ ] TypeScript strict compliance
- [ ] All E2E tests passing in Docker
- [ ] No serious accessibility issues
- [ ] Performance budgets met

**Status**: Ready for backend implementation phase. Frontend work blocked until organization API endpoints are available.

