# F2 — Service Rate Cards Analysis

## Executive Summary

This analysis covers the implementation of Service Rate Cards functionality for the Pivotal Flow platform. The epic focuses on services-only rate cards with fields for service name, unit of measure, buy/sell prices, and tax class, while preparing for future bundle capabilities.

## Business & Workflow Analysis

### Core Workflows

1. **Rate Card Management**
   - Create new rate cards per tenant
   - Add/edit/delete services within rate cards
   - Search and filter rate cards
   - Bulk operations for service management

2. **Service Configuration**
   - Define service name and description
   - Set unit of measure (hour/day/fixed)
   - Configure buy price (cost) and sell price (revenue)
   - Assign tax class for proper tax calculation

3. **Quote Integration (Future)**
   - Quotes will reference services from rate cards
   - Price calculations will be server-driven
   - Tax calculations based on assigned tax classes

### Data Model

```typescript
interface RateCard {
  id: string;
  organizationId: string; // Multi-tenant isolation
  name: string;
  description?: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  services: Service[];
}

interface Service {
  id: string;
  rateCardId: string;
  name: string;
  description?: string;
  unitOfMeasure: 'hour' | 'day' | 'fixed';
  buyPrice: number; // Cost
  sellPrice: number; // Revenue
  taxClassId: string;
  isActive: boolean;
  sortOrder: number;
}
```

## Architecture Alignment

### Multi-Tenancy (F1.5 Compliance)
- **Tenant Isolation**: All rate cards scoped by `organizationId`
- **RLS Enforcement**: Database-level row-level security
- **API Scoping**: All endpoints require tenant context
- **Cache Isolation**: React Query keys include tenant ID

### Security & RBAC
- **Authentication**: PASETO token validation
- **Authorization**: Role-based access control
- **Data Validation**: TypeBox schemas with strict validation
- **Audit Trail**: Event-driven observability for all mutations

### Technology Stack Alignment
- **Backend**: Fastify + TypeBox + Drizzle ORM
- **Frontend**: React + TypeScript + React Query + Radix UI
- **Database**: PostgreSQL with RLS policies
- **Testing**: Playwright E2E + Storybook + Vitest

## Implementation Plan

### Phase 1: Backend Foundation
1. **Database Schema**
   - Create `rate_cards` and `services` tables
   - Implement RLS policies for tenant isolation
   - Add indexes for performance

2. **API Endpoints**
   - `GET /api/v1/rate-cards` - List rate cards
   - `POST /api/v1/rate-cards` - Create rate card
   - `GET /api/v1/rate-cards/:id` - Get rate card details
   - `PUT /api/v1/rate-cards/:id` - Update rate card
   - `DELETE /api/v1/rate-cards/:id` - Delete rate card
   - `POST /api/v1/rate-cards/:id/services` - Add service
   - `PUT /api/v1/rate-cards/:id/services/:serviceId` - Update service
   - `DELETE /api/v1/rate-cards/:id/services/:serviceId` - Delete service

3. **TypeBox Schemas**
   - Request/response validation
   - Money type validation with proper rounding
   - Unit of measure validation

### Phase 2: Frontend Implementation
1. **Core Components**
   - `RateCardTable` - List and manage rate cards
   - `RateCardDrawer` - Create/edit rate cards
   - `ServiceRowEditor` - Inline service editing
   - `MoneyField` - Currency input with validation
   - `UomSelect` - Unit of measure selector

2. **Pages & Routes**
   - `/rate-cards` - Main rate cards page
   - Search, pagination, and filtering
   - Empty states and loading skeletons

3. **State Management**
   - React Query for server state
   - Optimistic updates for better UX
   - Proper error handling and retry logic

### Phase 3: Testing & Quality
1. **E2E Tests**
   - Rate card CRUD operations
   - Service management workflows
   - Multi-tenant isolation verification
   - Accessibility compliance

2. **Component Tests**
   - Storybook stories for all components
   - Interaction tests for complex workflows
   - Visual regression testing

3. **Performance & Accessibility**
   - Lighthouse CI budgets
   - Axe accessibility checks
   - Bundle size monitoring

## Security Risk Analysis

### High Risk
1. **Cross-Tenant Data Leakage**
   - **Mitigation**: RLS policies + API-level tenant scoping
   - **Testing**: E2E tests for tenant isolation

2. **Price Manipulation**
   - **Mitigation**: Server-side validation + audit logging
   - **Testing**: API contract validation

### Medium Risk
1. **SQL Injection**
   - **Mitigation**: Drizzle ORM parameterized queries
   - **Testing**: Security scanning in CI

2. **XSS in Service Names**
   - **Mitigation**: Input sanitization + CSP headers
   - **Testing**: Security headers validation

### Low Risk
1. **Performance Degradation**
   - **Mitigation**: Pagination + database indexes
   - **Testing**: Load testing + performance budgets

## Test Plan

### E2E Test Scenarios
1. **Rate Card Management**
   - Create rate card with services
   - Edit rate card details
   - Delete rate card with confirmation
   - Search and filter rate cards

2. **Service Management**
   - Add multiple services with different UOMs
   - Edit service prices and details
   - Reorder services
   - Delete services

3. **Multi-Tenant Isolation**
   - Verify Tenant A cannot see Tenant B's rate cards
   - Test API endpoints with wrong tenant context
   - Validate RLS enforcement

4. **Accessibility**
   - Keyboard navigation through all workflows
   - Screen reader compatibility
   - Focus management in modals/drawers

### Performance Benchmarks
- **Lighthouse CI**: LCP < 2.5s, JS < 180KB, main-thread < 2s
- **Bundle Size**: Rate cards route ≤ 50KB gzipped
- **API Response**: Rate cards list < 200ms

### Visual Regression
- Empty rate cards state
- Populated rate cards list
- Service editing modal
- Error states and loading skeletons

## Dependencies & Integration Points

### Current Dependencies
- F1.5: Multi-tenant authentication and authorization
- Existing UI component library
- Database schema and RLS policies

### Future Dependencies
- F4: Quote generation (will reference rate card services)
- F7: Invoicing (will use service pricing)
- Tax class management system

### External Dependencies
- Currency formatting libraries
- Date/time handling for audit trails
- Icon libraries for UI components

## Success Criteria

### Functional Requirements
- [ ] Create, read, update, delete rate cards
- [ ] Manage services within rate cards
- [ ] Search and filter functionality
- [ ] Multi-tenant data isolation
- [ ] Server-side price validation

### Non-Functional Requirements
- [ ] All TypeScript errors resolved
- [ ] 100% E2E test coverage for critical paths
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Performance budgets met
- [ ] Security scanning passed

### Documentation Requirements
- [ ] User manual for staff users
- [ ] Developer documentation
- [ ] API documentation updates
- [ ] Security policy compliance

## Risk Mitigation

### Technical Risks
1. **TypeScript Error Accumulation**
   - **Mitigation**: Fix errors incrementally, run typecheck after each change
   - **Monitoring**: CI pipeline with strict TypeScript checking

2. **Performance Regression**
   - **Mitigation**: Bundle size monitoring + Lighthouse CI
   - **Monitoring**: Performance budgets in CI

3. **Test Flakiness**
   - **Mitigation**: Stable test environment + proper waits
   - **Monitoring**: Test stability metrics

### Business Risks
1. **User Experience Degradation**
   - **Mitigation**: Comprehensive E2E testing + accessibility checks
   - **Monitoring**: User feedback + analytics

2. **Security Vulnerabilities**
   - **Mitigation**: Security scanning + penetration testing
   - **Monitoring**: Regular security audits

## Next Steps

1. **Immediate**: Fix existing TypeScript errors in frontend/backend
2. **Phase 1**: Implement backend API endpoints and database schema
3. **Phase 2**: Build frontend components and pages
4. **Phase 3**: Comprehensive testing and documentation
5. **Validation**: End-to-end verification and performance testing

This analysis provides the foundation for implementing F2 Service Rate Cards with proper architecture alignment, security considerations, and comprehensive testing coverage.
