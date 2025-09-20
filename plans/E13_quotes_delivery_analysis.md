# E13 — Quote Delivery & Approval System Analysis

## Current State Analysis

### Database Schema
**✅ Quotes table exists** with comprehensive structure:
- Status field with constraint: `('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'cancelled')`
- Timestamps: `sent_at`, `accepted_at`, `approved_at`, `expires_at`
- Multi-tenant: `organization_id` for data isolation
- Customer relationship: `customer_id` references customers table

**✅ Status Management**:
- Current statuses: `DRAFT | PENDING | APPROVED | SENT | ACCEPTED | REJECTED | CANCELLED`
- Status transitions defined in `STATUS_TRANSITIONS` object
- TypeBox schemas exist for validation

### Backend API
**✅ Existing Endpoints**:
- `GET /v1/quotes` - List quotes with filters
- `GET /v1/quotes/:id` - Get quote details
- `POST /v1/quotes` - Create quote
- `POST /v1/quotes/:id/status` - Status transitions
- Quote service with tenant context

**❌ Missing Endpoints** (need to implement):
- `POST /v1/quotes/:id/deliver` - Generate delivery link
- `GET /public/quotes/:token` - Public quote view (no auth)
- `POST /public/quotes/:token/accept` - Customer acceptance
- `POST /public/quotes/:token/reject` - Customer rejection

### Frontend
**✅ Existing Components**:
- `QuotesListScreen` - Main quotes list with status badges
- `QuoteDetailsPage` - Quote detail view
- Status colors and labels defined
- Integration with React Query

**❌ Missing Components** (need to implement):
- Quote delivery panel with "Deliver" button
- Public quote view page
- Customer approval form
- Status chips for new statuses (VIEWED, EXPIRED)

### SaaS Multi-Tenant Considerations
**✅ Current Implementation**:
- Organization-scoped data via `organization_id`
- Tenant context in backend services
- Permission-based access control

**🎯 SaaS Multi-Tenancy Requirements**:
- **Tenant Isolation**: Each organization's quotes completely isolated
- **Public URLs**: Must include tenant context without exposing internal IDs
- **Branding**: Public quote pages should reflect customer's organization branding
- **Domain Isolation**: Consider subdomain-based tenant routing (org1.app.com/quote/token)
- **Scalability**: Token validation must be efficient across thousands of tenants
- **Security**: No cross-tenant data leakage via public tokens

## Implementation Plan

### Phase 1: Backend API Extensions
1. **Quote Delivery Service**
   - Add `delivered_at` timestamp to quotes table
   - Generate secure tokens with org/quote binding
   - Implement delivery endpoint with email integration

2. **Public Quote API**
   - Token-based authentication for public access
   - Tenant isolation via token validation
   - Customer approval/rejection endpoints

3. **Status Management**
   - Add VIEWED and EXPIRED status handling
   - Enhance status transition validation
   - Add delivery tracking

### Phase 2: Frontend Staff Interface
1. **Quote Status Enhancements**
   - Add VIEWED and EXPIRED status chips
   - Delivery history display
   - "Deliver" button with confirmation modal

2. **Quote Detail Improvements**
   - Delivery panel showing timestamps
   - Copyable public URL display
   - Status transition history

### Phase 3: Public Customer Portal
1. **Public Quote View**
   - Dedicated public app route
   - Quote summary with line items
   - Tax calculations and totals

2. **Customer Approval Flow**
   - Approve/Decline buttons
   - Approval form (name, role, terms)
   - Success/rejection confirmation

### Phase 4: Testing & Validation
1. **Storybook Components**
   - QuoteStatusChip
   - QuoteDeliveryPanel
   - QuoteCustomerView
   - ApprovalForm

2. **E2E Testing**
   - Complete delivery workflow
   - Public approval process
   - Status synchronization

## Technical Considerations

### SaaS Security
- **Token Structure**: Include tenant ID in signed JWT tokens to prevent cross-tenant access
- **Cryptographic Security**: Use crypto.randomBytes for token generation
- **Expiration Strategy**: Tokens expire with quote validity or 30 days max
- **Rate Limiting**: Per-tenant rate limits on public endpoints
- **Audit Trail**: Log all public quote access for security monitoring

### SaaS Performance & Scalability
- **Token Validation**: O(1) lookup via database index on public_token
- **Caching Strategy**: Cache public quote data with tenant-scoped keys
- **CDN Ready**: Public assets served via CDN with tenant-specific paths
- **Database Sharding**: Schema supports future tenant-based sharding
- **Monitoring**: Track public quote view metrics per tenant

### SaaS Branding & Customization
- **Organization Branding**: Public quotes display customer's logo/colors
- **Custom Domains**: Support for custom domain mapping (future)
- **Email Templates**: Tenant-specific email templates for delivery
- **Terms & Conditions**: Per-organization terms in approval flow

## Database Changes Required

### New Fields
```sql
-- Add delivery tracking to quotes table
ALTER TABLE quotes ADD COLUMN delivered_at TIMESTAMP;
ALTER TABLE quotes ADD COLUMN viewed_at TIMESTAMP;
ALTER TABLE quotes ADD COLUMN public_token VARCHAR(255) UNIQUE;
ALTER TABLE quotes ADD COLUMN token_expires_at TIMESTAMP;
```

### Indexes
```sql
CREATE INDEX idx_quotes_public_token ON quotes(public_token) WHERE public_token IS NOT NULL;
CREATE INDEX idx_quotes_delivered_at ON quotes(delivered_at);
```

## API Contract Changes

### New Endpoints
1. `POST /v1/quotes/:id/deliver`
   - Request: `{ recipientEmail?: string, message?: string }`
   - Response: `{ publicUrl: string, deliveredAt: string, token: string }`

2. `GET /public/quotes/:token`
   - No authentication required
   - Response: Quote details with line items
   - Tenant-scoped via token validation

3. `POST /public/quotes/:token/accept`
   - Request: `{ name: string, role: string, checkedTerms: boolean }`
   - Response: `{ success: boolean, acceptedAt: string }`

4. `POST /public/quotes/:token/reject`
   - Request: `{ reason: string }`
   - Response: `{ success: boolean, rejectedAt: string }`

## Event System
- `quote.delivered` - When quote is sent to customer
- `quote.viewed` - When customer opens public link
- `quote.accepted` - When customer approves
- `quote.rejected` - When customer declines

## Next Steps
1. Implement database migrations
2. Create delivery service and API endpoints
3. Build public quote components
4. Add status management enhancements
5. Implement E2E testing
6. Add Storybook stories

## Risk Assessment
- **Low Risk**: Database changes are additive
- **Medium Risk**: Public routes need careful security review
- **Low Risk**: Frontend changes are isolated components
- **Medium Risk**: Token generation must be cryptographically secure
