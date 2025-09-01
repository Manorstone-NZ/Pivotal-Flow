# Pivotal Flow Quotes API Documentation

## Overview

This document provides comprehensive documentation for the Pivotal Flow Quotes API, including OpenAPI specification, examples, and implementation details.

## OpenAPI Specification

The complete OpenAPI 3.0.3 specification is available in `openapi-quotes.yaml`. This specification includes:

- **Complete API Documentation**: All quote endpoints with detailed descriptions
- **Request/Response Schemas**: Comprehensive schema definitions for all data types
- **Examples**: Real-world examples for all endpoints
- **Security Schemas**: JWT authentication and multi-tenant access control
- **Error Handling**: Detailed error responses with codes and messages

### Key Features Documented

1. **Quote Management**
   - Create, read, update quotes
   - Status transitions (draft → pending → approved → sent → accepted)
   - Automatic calculations (subtotal, tax, discounts, total)

2. **Multi-tenancy**
   - Organization-based data isolation
   - User context validation
   - Cross-organization access prevention

3. **Business Logic**
   - Quote number generation with organization prefixes
   - Line item calculations
   - Audit logging for all changes

## API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/quotes` | List quotes with filtering and pagination |
| `POST` | `/v1/quotes` | Create a new quote |
| `GET` | `/v1/quotes/{id}` | Get quote by ID |
| `PUT` | `/v1/quotes/{id}` | Update quote |
| `POST` | `/v1/quotes/{id}/status` | Transition quote status |

### Features

- **Filtering**: By status, customer, project, type, date range
- **Search**: Full-text search on title and description
- **Sorting**: By creation date, update date, title, status, total amount
- **Pagination**: Configurable page size (1-100 items)
- **Validation**: Comprehensive input validation with detailed error messages

## Data Models

### Quote Status Workflow

```
draft → pending → approved → sent → accepted
  ↓        ↓         ↓        ↓        ↓
cancelled ← cancelled ← cancelled ← cancelled ← cancelled
```

### Key Data Types

- **Quote**: Main entity with all quote details
- **LineItem**: Individual items within a quote
- **Money**: Precise decimal amounts with currency
- **Status**: Enum values for quote lifecycle
- **Metadata**: Flexible object for additional data

## Authentication & Security

### JWT Token Requirements

```json
{
  "sub": "user-id",
  "org": "organization-id", 
  "iat": "issued-at-timestamp",
  "exp": "expiration-timestamp"
}
```

### Multi-tenant Access Control

- All quotes are scoped to the user's organization
- Users can only access quotes within their organization
- Cross-organization access is prevented at the API level

## Examples

### Creating a Quote

```bash
curl -X POST http://localhost:3000/v1/quotes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Website Development Project",
    "description": "Complete website development",
    "type": "project",
    "validFrom": "2025-01-01T00:00:00Z",
    "validUntil": "2025-12-31T23:59:59Z",
    "currency": "NZD",
    "taxRate": 0.15,
    "lineItems": [
      {
        "lineNumber": 1,
        "type": "service",
        "description": "Web Development",
        "quantity": 40,
        "unitPrice": {
          "amount": "150.00",
          "currency": "NZD"
        },
        "taxRate": 0.15,
        "serviceCategoryId": "550e8400-e29b-41d4-a716-446655440000"
      }
    ]
  }'
```

### Transitioning Quote Status

```bash
curl -X POST http://localhost:3000/v1/quotes/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "pending"
  }'
```

## Implementation Status

### ✅ Completed

1. **TypeScript Compilation Issues Fixed**
   - All line items now use `Decimal` for amounts
   - Removed unused imports
   - Fixed pagination options
   - Resolved type assertion issues

2. **Database Integration**
   - Drizzle ORM fully integrated
   - Multi-tenant schema with organization isolation
   - Quote number generation with organization prefixes
   - Audit logging for all changes

3. **Integration Testing**
   - Comprehensive test suite with 8 test cases
   - Multi-tenant isolation testing
   - Status transition validation
   - Calculation verification
   - Audit logging verification

4. **OpenAPI Documentation**
   - Complete OpenAPI 3.0.3 specification
   - Detailed schema definitions
   - Real-world examples for all endpoints
   - Security schema documentation
   - Error response documentation

### 🔧 Technical Implementation

- **Database**: PostgreSQL with Drizzle ORM
- **Framework**: Fastify with TypeScript
- **Validation**: Zod schemas with comprehensive validation
- **Multi-tenancy**: Organization-based data isolation
- **Audit Logging**: Complete change tracking
- **Calculations**: Precise decimal arithmetic with decimal.js

### 🚀 Features Implemented

- **Quote Creation**: With automatic number generation and calculations
- **Quote Updates**: With automatic recalculation and audit logging
- **Status Transitions**: With validation and automatic field updates
- **Multi-tenant Access**: Complete organization isolation
- **Line Item Management**: With individual calculations
- **Audit Logging**: Complete change history
- **API Documentation**: Comprehensive OpenAPI specification

## Next Steps

1. **Frontend Integration**: Use the OpenAPI specification to generate client SDKs
2. **Additional Endpoints**: Consider adding quote templates, bulk operations
3. **Enhanced Features**: PDF generation, email notifications, approval workflows
4. **Performance Optimization**: Add caching, database indexing, query optimization

## Development

### Running Tests

```bash
# Run integration tests
npx vitest run src/modules/quotes/__tests__/integration.test.ts --reporter=verbose

# Run TypeScript compilation check
npx tsc --noEmit
```

### Database Setup

```bash
# Start database
cd ../../scripts/docker && ./up.sh

# Run migrations
npx drizzle-kit migrate
```

### API Testing

Use the OpenAPI specification with tools like:
- Swagger UI
- Postman
- Insomnia
- curl (with examples provided)

## Support

For questions or issues:
- Email: support@pivotalflow.com
- Documentation: https://docs.pivotalflow.com/quotes
- OpenAPI Spec: `openapi-quotes.yaml`
