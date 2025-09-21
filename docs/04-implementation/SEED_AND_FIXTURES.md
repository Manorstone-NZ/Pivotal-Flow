# Seed and Fixtures Guide

## Overview

The C2 Seed and Fixtures system provides a minimal development dataset that exercises typical business flows across customers, projects, quotes, invoices, payments, and time entries. All scripts are idempotent and safe to re-run.

## Scripts

### 1. Seed Script (`scripts/dev/seed.sh`)

Creates foundational data:
- **Organizations**: ACME Corporation, TechStart Inc, Consulting Partners
- **Users**: Admin, Manager, Consultant, Customer users
- **Roles**: Administrator, Manager, User, Customer roles
- **Permissions**: View, Create, Edit, Approve permissions for all resources
- **Customers**: ACME Client Corp, TechStart Solutions, Consulting Partners Ltd
- **Projects**: Website Redesign, Mobile App Development, Business Consulting
- **Rate Cards**: Standard and Premium rate cards with service categories

### 2. Fixtures Script (`scripts/dev/fixtures.sh`)

Creates business data:
- **Quotes**: 4 quotes with different statuses (draft, sent, approved, accepted)
- **Quote Line Items**: Detailed line items with rates and quantities
- **Invoices**: 3 invoices linked to quotes
- **Invoice Line Items**: Detailed line items matching quotes
- **Payments**: Partial and full payments
- **Time Entries**: 12 time entries across 3 projects with different statuses
- **Approval Requests**: Quote and time entry approval workflows

### 3. Smoke Test Script (`scripts/dev/smoke-test.sh`)

Runs both scripts and performs basic API validation:
- Executes seed and fixtures scripts
- Tests health endpoint
- Tests quotes, invoices, and time entries endpoints
- Tests portal endpoints
- Validates specific entities exist

## Usage

### Basic Usage

```bash
# Run seed script only
./scripts/dev/seed.sh

# Run fixtures script only
./scripts/dev/fixtures.sh

# Run both scripts
./scripts/dev/seed.sh && ./scripts/dev/fixtures.sh

# Run smoke test (recommended)
./scripts/dev/smoke-test.sh
```

### Development Workflow

1. **Fresh Start**: Run smoke test to get complete dataset
2. **Add Features**: Run individual scripts as needed
3. **Reset Data**: Re-run scripts (idempotent, safe to repeat)

## Created Entities

### Organizations
- `org_acme` - ACME Corporation
- `org_techstart` - TechStart Inc  
- `org_consulting` - Consulting Partners

### Users
- `user_admin` - admin@acme.com (Administrator)
- `user_manager` - manager@acme.com (Manager)
- `user_consultant` - consultant@acme.com (User)
- `user_customer1` - customer1@acme.com (Customer)
- `user_customer2` - customer2@acme.com (Customer)

### Customers
- `customer_acme` - ACME Client Corp
- `customer_techstart` - TechStart Solutions
- `customer_consulting` - Consulting Partners Ltd

### Projects
- `project_website` - Website Redesign
- `project_mobile` - Mobile App Development
- `project_consulting` - Business Consulting

### Quotes
- `quote_website_v1` - $15,000 (approved)
- `quote_mobile_v1` - $25,000 (sent)
- `quote_consulting_v1` - $12,000 (draft)
- `quote_website_v2` - $18,000 (accepted)

### Invoices
- `invoice_website_v1` - $15,000 (sent)
- `invoice_mobile_v1` - $25,000 (draft)
- `invoice_website_v2` - $18,000 (paid)

### Payments
- `payment_website_v1_partial` - $7,500 (partial)
- `payment_website_v2_full` - $18,000 (full)

### Time Entries
- 12 time entries across 3 projects
- Mix of approved and pending statuses
- Various durations and descriptions

## Business Flows

### Quote → Invoice → Payment Flow
1. Quote created (`quote_website_v1`)
2. Quote approved (`approval_quote_website_v1`)
3. Invoice created (`invoice_website_v1`)
4. Payment received (`payment_website_v1_partial`)

### Time Entry → Approval Flow
1. Time entry created (`time_mobile_dev_1`)
2. Approval request created (`approval_time_mobile_dev_1`)
3. Status: pending approval

### Multiple Project Statuses
- **Website Project**: Completed with payments
- **Mobile Project**: In progress with pending time entries
- **Consulting Project**: Planning phase

## Testing

### API Endpoints to Test

```bash
# Health check
curl http://localhost:3000/health

# Quotes
curl http://localhost:3000/v1/quotes?page=1&pageSize=10

# Invoices  
curl http://localhost:3000/v1/invoices?page=1&pageSize=10

# Time entries
curl http://localhost:3000/v1/time-entries?page=1&pageSize=10

# Portal endpoints (may require auth)
curl http://localhost:3000/v1/portal/quotes?page=1&pageSize=10
curl http://localhost:3000/v1/portal/invoices?page=1&pageSize=10
curl http://localhost:3000/v1/portal/time-entries?page=1&pageSize=10
```

### Specific Entity Tests

```bash
# Test specific quote exists
curl http://localhost:3000/v1/quotes/quote_website_v1

# Test specific invoice exists
curl http://localhost:3000/v1/invoices/invoice_website_v1

# Test specific time entry exists
curl http://localhost:3000/v1/time-entries/time_web_design_1
```

## Rate Cards and Pricing

### Standard Rate Card (`rate_standard`)
- Development: $150/hour
- Design: $120/hour
- Consulting: $200/hour
- Project Management: $180/hour

### Premium Rate Card (`rate_premium`)
- Senior Development: $200/hour
- Senior Design: $160/hour
- Senior Consulting: $250/hour

## Service Categories
- `cat_development` - Software development services
- `cat_design` - UI/UX design services
- `cat_consulting` - Business consulting services
- `cat_project_management` - Project management services

## Permissions and Roles

### Administrator Role
- All permissions for all resources
- Can approve quotes and time entries
- Full system access

### Manager Role
- Most permissions except user creation
- Can approve quotes and time entries
- Project and team management

### User Role
- Basic permissions for quotes, invoices, time
- Can create quotes and time entries
- Limited access

### Customer Role
- Portal access only
- Can view their quotes, invoices, time entries
- External user access

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running: `./scripts/docker/check-env.sh`
   - Check DATABASE_URL environment variable

2. **Script Permission Denied**
   - Make scripts executable: `chmod +x scripts/dev/*.sh`

3. **API Endpoints Return 401/403**
   - Most endpoints require authentication
   - Use smoke test for basic validation
   - Portal endpoints require customer user tokens

4. **Data Not Found**
   - Re-run seed and fixtures scripts
   - Check database connection
   - Verify organization_id matches

### Reset Data

```bash
# Drop and recreate database
./scripts/docker/down.sh --volumes
./scripts/docker/up.sh

# Re-run seed and fixtures
./scripts/dev/smoke-test.sh
```

## Best Practices

1. **Always run smoke test first** - Ensures complete setup
2. **Use specific entity IDs** - For testing specific scenarios
3. **Check API responses** - Verify data was created correctly
4. **Test business flows** - Quote→Invoice→Payment, Time→Approval
5. **Re-run scripts safely** - All scripts are idempotent

## Next Steps

After running seed and fixtures:
1. Test API endpoints with authentication
2. Explore business flows end-to-end
3. Test portal access with customer users
4. Validate reporting and export functionality
5. Test rate limiting and security features
