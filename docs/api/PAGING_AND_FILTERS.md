# Paging and Filters Documentation

## Overview
This document describes the shared paging and filtering system implemented in the CF3 epic. The system provides standardized schemas and utilities for consistent pagination and filtering across all API endpoints.

## Shared Paging Schema

### Location
`packages/shared/src/api/schemas.ts`

### Core Schemas

#### `PagingRequestSchema`
Base schema for paging requests:
```typescript
{
  page: number (min: 1, default: 1),
  pageSize: number (min: 1, max: 100, default: 20)
}
```

#### `PagingResponseSchema`
Base schema for paging responses:
```typescript
{
  items: any[],
  page: number,
  pageSize: number,
  total: number,
  totalPages: number
}
```

### Usage Examples

#### Basic Paging Request
```typescript
import { PagingRequestSchema } from '@pivotal-flow/shared';

const request = {
  page: 1,
  pageSize: 20
};

const validated = PagingRequestSchema.parse(request);
```

#### Creating Paging Response
```typescript
import { createPagingResponse } from '@pivotal-flow/shared';

const items = [/* array of items */];
const page = 1;
const pageSize = 20;
const total = 100;

const response = createPagingResponse(items, page, pageSize, total);
// Returns: { items, page, pageSize, total, totalPages: 5 }
```

## Filter Schemas

### String Filters
```typescript
import { FilterStringSchema, createStringFilter } from '@pivotal-flow/shared';

const filter = createStringFilter('name', 'john', 'contains');
// Returns: { field: 'name', value: 'john', operator: 'contains' }

const operators = ['eq', 'ne', 'contains', 'startsWith', 'endsWith'];
```

### Boolean Filters
```typescript
import { FilterBooleanSchema, createBooleanFilter } from '@pivotal-flow/shared';

const filter = createBooleanFilter('isActive', true);
// Returns: { field: 'isActive', value: true, operator: 'eq' }
```

### Number Filters
```typescript
import { FilterNumberSchema, createNumberFilter } from '@pivotal-flow/shared';

const filter = createNumberFilter('amount', 100, 'gte');
// Returns: { field: 'amount', value: 100, operator: 'gte' }

const operators = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'];
```

### Date Range Filters
```typescript
import { DateRangeSchema, createDateRange } from '@pivotal-flow/shared';

const filter = createDateRange('createdAt', '2024-01-01', '2024-12-31');
// Returns: { field: 'createdAt', startDate: '2024-01-01', endDate: '2024-12-31' }
```

### Sort Options
```typescript
import { SortSchema, createSort } from '@pivotal-flow/shared';

const sort = createSort('name', 'asc');
// Returns: { field: 'name', direction: 'asc' }

const directions = ['asc', 'desc'];
```

## Combined Filters Schema

### `FiltersSchema`
Combines all filter types into a single schema:
```typescript
{
  stringFilters?: FilterString[],
  booleanFilters?: FilterBoolean[],
  numberFilters?: FilterNumber[],
  dateRanges?: DateRange[],
  sorts?: Sort[]
}
```

### Usage Example
```typescript
import { FiltersSchema } from '@pivotal-flow/shared';

const filters = {
  stringFilters: [
    createStringFilter('name', 'john', 'contains')
  ],
  booleanFilters: [
    createBooleanFilter('isActive', true)
  ],
  numberFilters: [
    createNumberFilter('amount', 100, 'gte')
  ],
  dateRanges: [
    createDateRange('createdAt', '2024-01-01', '2024-12-31')
  ],
  sorts: [
    createSort('name', 'asc'),
    createSort('createdAt', 'desc')
  ]
};

const validated = FiltersSchema.parse(filters);
```

## Integration with Route Schemas

### Example: Approvals Module
```typescript
// In schemas.ts
import { PagingRequestSchema, PagingResponseSchema, createPagingResponse } from '@pivotal-flow/shared';

export const ApprovalFiltersSchema = z.object({
  entityType: z.enum(['quote', 'invoice', 'project']).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  approverId: z.string().uuid().optional(),
  requestedBy: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20)
});

export const ListApprovalsResponseSchema = PagingResponseSchema.extend({
  items: z.array(ApprovalRequestResponseSchema)
});

export const createApprovalsPagingResponse = (
  approvals: ApprovalRequest[],
  page: number,
  pageSize: number,
  total: number
) => {
  return createPagingResponse(approvals, page, pageSize, total);
};
```

### Example: Allocations Module
```typescript
// In schemas.ts
export const AllocationFiltersSchema = z.object({
  projectId: z.string().optional(),
  userId: z.string().optional(),
  role: z.enum(['developer', 'designer', 'manager']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isBillable: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20)
});

export const ListAllocationsResponseSchema = PagingResponseSchema.extend({
  items: z.array(ResourceAllocationResponseSchema)
});
```

## Route Implementation Examples

### List Endpoint with Paging
```typescript
// In routes.ts
fastify.get('/v1/approvals', {
  schema: {
    querystring: ApprovalFiltersSchema,
    response: {
      200: ListApprovalsResponseSchema,
      400: ErrorResponseSchema
    }
  }
}, async (request: FastifyRequest<{ Querystring: z.infer<typeof ApprovalFiltersSchema> }>, reply: FastifyReply) => {
  try {
    const query = ApprovalFiltersSchema.parse(request.query);
    
    const approvals = await approvalService.getApprovalRequests(query);
    
    const pagingResponse = createApprovalsPagingResponse(
      approvals,
      query.page || 1,
      query.pageSize || 20,
      approvals.length // In real implementation, this would be total count
    );
    
    reply.send(pagingResponse);
  } catch (error) {
    reply.status(400).send({
      error: 'Bad Request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
```

## Validation and Error Handling

### Invalid Paging Parameters
```typescript
// These will throw validation errors:
{ page: 0 }        // page must be >= 1
{ pageSize: 0 }     // pageSize must be >= 1
{ pageSize: 101 }   // pageSize must be <= 100
```

### Invalid Filter Parameters
```typescript
// These will throw validation errors:
{ operator: 'invalid' }  // operator must be one of allowed values
{ direction: 'invalid' }  // direction must be 'asc' or 'desc'
```

## Best Practices

1. **Consistent Paging**: Always use `page` and `pageSize` parameters
2. **Response Format**: Always return the standard paging envelope
3. **Validation**: Use Zod schemas for all input validation
4. **Helper Functions**: Use the provided helper functions for creating filters and responses
5. **Type Safety**: Leverage TypeScript inference for request/response types

## Migration Guide

### From Old Paging Format
```typescript
// Old format
{
  data: [...],
  total: 100,
  page: 1,
  limit: 20
}

// New format
{
  items: [...],
  total: 100,
  page: 1,
  pageSize: 20,
  totalPages: 5
}
```

### From Manual Filter Building
```typescript
// Old way
const filters = {
  name: request.query.name,
  status: request.query.status
};

// New way
const filters = {
  stringFilters: [
    createStringFilter('name', request.query.name, 'contains')
  ],
  booleanFilters: [
    createBooleanFilter('status', request.query.status === 'active')
  ]
};
```

## Testing

### Unit Tests for Schemas
```typescript
import { describe, it, expect } from 'vitest';
import { PagingRequestSchema, createPagingResponse } from '@pivotal-flow/shared';

describe('Paging Schemas', () => {
  it('should validate valid paging request', () => {
    const request = { page: 1, pageSize: 20 };
    const result = PagingRequestSchema.parse(request);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('should reject invalid page number', () => {
    expect(() => PagingRequestSchema.parse({ page: 0 })).toThrow();
  });

  it('should create paging response', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const response = createPagingResponse(items, 1, 20, 100);
    expect(response.items).toEqual(items);
    expect(response.totalPages).toBe(5);
  });
});
```

### Contract Tests
```typescript
describe('Paging Contract Tests', () => {
  it('should return standard paging envelope', async () => {
    const response = await request.get('/v1/approvals?page=1&pageSize=20');
    
    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('pageSize');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('totalPages');
  });
});
```

## Future Enhancements

1. **Cursor-based Pagination**: Add support for cursor-based pagination
2. **Advanced Filtering**: Add support for complex filter combinations
3. **Search Integration**: Integrate with full-text search capabilities
4. **Caching**: Add caching support for frequently accessed pages
5. **Analytics**: Add pagination analytics and metrics
