/**
 * Pagination and Filtering Utilities for C0 Backend Readiness
 * Standard envelope with pagination and filtering validation
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';

// Standard pagination schema - unified format
export const PaginationSchema = Type.Object({
  page: Type.Number({ minimum: 1, default: 1 }),
  size: Type.Number({ minimum: 1, maximum: 100, default: 25 }),
  sort: Type.Optional(Type.String()),
  filter: Type.Optional(Type.String()),
});

// Legacy pagination schema for backward compatibility during transition
export const LegacyPaginationSchema = Type.Object({
  page: Type.Number({ minimum: 1, default: 1 }),
  pageSize: Type.Number({ minimum: 1, maximum: 100, default: 25 }),
});

// Common filter schema
export const CommonFilterSchema = Type.Object({
  search: Type.Optional(Type.String()),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Union([Type.Literal('asc'), Type.Literal('desc')], { default: 'desc' }),
});

// Standard pagination envelope type - unified format
export interface PaginationEnvelope<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    organization_id?: string;
    filtered_count?: number;
  };
}

// Legacy pagination envelope for backward compatibility
export interface LegacyPaginationEnvelope<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    organization_id?: string;
    filtered_count?: number;
  };
}

// Filter validation result
export interface FilterValidationResult {
  isValid: boolean;
  errors: string[];
  allowedFilters: string[];
  allowedSorts: string[];
}

/**
 * Create standardized pagination envelope
 */
export function createPaginationEnvelope<T>(
  items: T[],
  page: number,
  size: number,
  total: number,
  organizationId?: string
): PaginationEnvelope<T> {
  const totalPages = Math.ceil(total / size);
  
  return {
    data: items,
    meta: {
      page,
      size,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      ...(organizationId && { organization_id: organizationId }),
      filtered_count: items.length
    }
  };
}

/**
 * Create legacy pagination envelope for backward compatibility
 */
export function createLegacyPaginationEnvelope<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number,
  organizationId?: string
): LegacyPaginationEnvelope<T> {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    meta: {
      ...(organizationId && { organization_id: organizationId }),
      filtered_count: items.length
    }
  };
}

/**
 * Calculate pagination offset
 */
export function getPaginationOffset(page: number, size: number): number {
  return (page - 1) * size;
}

/**
 * Type guard to check if value is a record
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validate filters against allowed filters
 */
export function validateFilters(
  query: unknown,
  allowedFilters: string[],
  allowedSorts: string[] = []
): FilterValidationResult {
  const errors: string[] = [];
  
  // Type guard to ensure query is an object
  if (!isRecord(query)) {
    return {
      isValid: true,
      errors: [],
      allowedFilters,
      allowedSorts
    };
  }
  
  const queryObj = query;
  const providedFilters = Object.keys(queryObj).filter(key => 
    !['page', 'pageSize', 'search'].includes(key)
  );
  
  // Check for unknown filters
  const unknownFilters = providedFilters.filter(filter => 
    !allowedFilters.includes(filter) && !filter.startsWith('sort')
  );
  
  if (unknownFilters.length > 0) {
    errors.push(`Unknown filters: ${unknownFilters.join(', ')}. Allowed filters: ${allowedFilters.join(', ')}`);
  }
  
  // Check for unknown sort fields
  if (queryObj['sortBy'] && allowedSorts.length > 0 && !allowedSorts.includes(queryObj['sortBy'] as string)) {
    errors.push(`Unknown sort field: ${queryObj['sortBy']}. Allowed sorts: ${allowedSorts.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    allowedFilters,
    allowedSorts
  };
}

/**
 * Parse and validate pagination parameters - unified format
 */
export function parsePaginationParams(query: Record<string, any>) {
  const page = parseInt(query['page'] as string) || 1;
  const size = parseInt(query['size'] as string) || 25;
  
  // Validate pagination limits
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  
  if (size < 1 || size > 100) {
    throw new Error('Page size must be between 1 and 100');
  }
  
  return { page, size };
}

/**
 * Parse and validate legacy pagination parameters
 */
export function parseLegacyPaginationParams(query: Record<string, any>) {
  const page = parseInt(query['page'] as string) || 1;
  const pageSize = parseInt(query['pageSize'] as string) || 25;
  
  // Validate pagination limits
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  
  if (pageSize < 1 || pageSize > 100) {
    throw new Error('Page size must be between 1 and 100');
  }
  
  return { page, pageSize };
}

/**
 * Build database query with pagination - unified format
 */
export function buildPaginationQuery<T extends { limit: (n: number) => T; offset: (n: number) => T; orderBy: (field: string, order: string) => T }>(
  baseQuery: T,
  page: number,
  size: number,
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): T {
  const offset = getPaginationOffset(page, size);

  // The Drizzle ORM query builder returns a new query object on each call,
  // so we need to chain the calls and return the final query.
  let query = baseQuery.limit(size);
  query = query.offset(offset);

  if (sortBy) {
    query = query.orderBy(sortBy, sortOrder);
  }

  return query;
}

/**
 * Resource-specific filter schemas
 */

// User filters
export const UserFilterSchema = Type.Intersect([
  CommonFilterSchema,
  Type.Object({
    role: Type.Optional(Type.String()),
    status: Type.Optional(Type.Union([Type.Literal('active'), Type.Literal('inactive'), Type.Literal('suspended')])),
    organizationId: Type.Optional(Type.String({ format: 'uuid' })),
  })
]);

export const USER_ALLOWED_FILTERS = ['role', 'status', 'organizationId'];
export const USER_ALLOWED_SORTS = ['createdAt', 'email', 'firstName', 'lastName'];

// Quote filters
export const QuoteFilterSchema = Type.Intersect([
  CommonFilterSchema,
  Type.Object({
    status: Type.Optional(Type.Union([
      Type.Literal('draft'), 
      Type.Literal('pending'), 
      Type.Literal('approved'), 
      Type.Literal('sent'), 
      Type.Literal('accepted'), 
      Type.Literal('rejected'), 
      Type.Literal('cancelled')
    ])),
    customerId: Type.Optional(Type.String({ format: 'uuid' })),
    projectId: Type.Optional(Type.String({ format: 'uuid' })),
    validFrom: Type.Optional(Type.String({ format: 'date-time' })),
    validUntil: Type.Optional(Type.String({ format: 'date-time' })),
  })
]);

export const QUOTE_ALLOWED_FILTERS = ['status', 'customerId', 'projectId', 'validFrom', 'validUntil'];
export const QUOTE_ALLOWED_SORTS = ['createdAt', 'totalAmount', 'validUntil', 'status'];

// Project filters
export const ProjectFilterSchema = Type.Intersect([
  CommonFilterSchema,
  Type.Object({
    status: Type.Optional(Type.Union([
      Type.Literal('planning'), 
      Type.Literal('active'), 
      Type.Literal('on-hold'), 
      Type.Literal('completed'), 
      Type.Literal('cancelled')
    ])),
    customerId: Type.Optional(Type.String({ format: 'uuid' })),
    projectManagerId: Type.Optional(Type.String({ format: 'uuid' })),
    priority: Type.Optional(Type.Union([
      Type.Literal('low'), 
      Type.Literal('medium'), 
      Type.Literal('high'), 
      Type.Literal('urgent')
    ])),
  })
]);

export const PROJECT_ALLOWED_FILTERS = ['status', 'customerId', 'projectManagerId', 'priority'];
export const PROJECT_ALLOWED_SORTS = ['createdAt', 'startDate', 'endDate', 'priority'];

// Time entry filters
export const TimeEntryFilterSchema = Type.Intersect([
  CommonFilterSchema,
  Type.Object({
    userId: Type.Optional(Type.String({ format: 'uuid' })),
    projectId: Type.Optional(Type.String({ format: 'uuid' })),
    taskId: Type.Optional(Type.String({ format: 'uuid' })),
    status: Type.Optional(Type.Union([
      Type.Literal('pending'), 
      Type.Literal('approved'), 
      Type.Literal('rejected'), 
      Type.Literal('invoiced')
    ])),
    billable: Type.Optional(Type.Boolean()),
    dateFrom: Type.Optional(Type.String({ format: 'date-time' })),
    dateTo: Type.Optional(Type.String({ format: 'date-time' })),
  })
]);

export const TIME_ENTRY_ALLOWED_FILTERS = ['userId', 'projectId', 'taskId', 'status', 'billable', 'dateFrom', 'dateTo'];
export const TIME_ENTRY_ALLOWED_SORTS = ['date', 'durationHours', 'createdAt'];

// Payment filters
export const PaymentFilterSchema = Type.Intersect([
  CommonFilterSchema,
  Type.Object({
    status: Type.Optional(Type.Union([
      Type.Literal('pending'), 
      Type.Literal('completed'), 
      Type.Literal('failed'), 
      Type.Literal('cancelled')
    ])),
    method: Type.Optional(Type.String()),
    customerId: Type.Optional(Type.String({ format: 'uuid' })),
    amountFrom: Type.Optional(Type.Number()),
    amountTo: Type.Optional(Type.Number()),
  })
]);

export const PAYMENT_ALLOWED_FILTERS = ['status', 'method', 'customerId', 'amountFrom', 'amountTo'];
export const PAYMENT_ALLOWED_SORTS = ['createdAt', 'amount', 'status'];

// Portal filters
export const PortalFilterSchema = Type.Intersect([
  CommonFilterSchema,
  Type.Object({
    status: Type.Optional(Type.Union([
      Type.Literal('draft'), 
      Type.Literal('sent'), 
      Type.Literal('accepted'), 
      Type.Literal('rejected'), 
      Type.Literal('expired')
    ])),
    customerId: Type.String({ format: 'uuid' }),
  })
]);

export const PORTAL_ALLOWED_FILTERS = ['status', 'customerId'];
export const PORTAL_ALLOWED_SORTS = ['createdAt', 'totalAmount', 'status'];

/**
 * Create filter validation middleware
 */
export function createFilterValidationMiddleware(
  allowedFilters: string[],
  allowedSorts: string[] = []
) {
  return function validateFiltersMiddleware(request: FastifyRequest, reply: FastifyReply, done: () => void) {
    const validation = validateFilters(request.query, allowedFilters, allowedSorts);
    
    if (!validation.isValid) {
      reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid filter parameters',
          details: {
            errors: validation.errors,
            allowedFilters: validation.allowedFilters,
            allowedSorts: validation.allowedSorts
          },
          timestamp: new Date().toISOString(),
          request_id: request.id
        },
        meta: {
          api_version: '1.0.0',
          documentation_url: 'https://api.pivotalflow.com/docs'
        }
      });
      return;
    }
    
    done();
  };
}

/**
 * Standard response serializer for pagination - unified format
 */
export function createPaginationSerializer<T>() {
  return function serializePaginationResponse(
    items: T[],
    page: number,
    size: number,
    total: number,
    organizationId?: string
  ) {
    return createPaginationEnvelope(items, page, size, total, organizationId);
  };
}

/**
 * Legacy response serializer for pagination - backward compatibility
 */
export function createLegacyPaginationSerializer<T>() {
  return function serializeLegacyPaginationResponse(
    items: T[],
    page: number,
    pageSize: number,
    total: number,
    organizationId?: string
  ) {
    return createLegacyPaginationEnvelope(items, page, pageSize, total, organizationId);
  };
}
