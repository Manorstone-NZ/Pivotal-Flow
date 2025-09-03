/**
 * Pagination and Filtering Utilities for C0 Backend Readiness
 * Standard envelope with pagination and filtering validation
 */

import { z } from 'zod';

// Standard pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(1000).default(25),
});

// Common filter schema
export const CommonFilterSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Pagination envelope type
export interface PaginationEnvelope<T> {
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
 * Create pagination envelope
 */
export function createPaginationEnvelope<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number,
  organizationId?: string
): PaginationEnvelope<T> {
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
export function getPaginationOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * Validate filters against allowed filters
 */
export function validateFilters(
  query: Record<string, any>,
  allowedFilters: string[],
  allowedSorts: string[] = []
): FilterValidationResult {
  const errors: string[] = [];
  const providedFilters = Object.keys(query).filter(key => 
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
  if (query['sortBy'] && allowedSorts.length > 0 && !allowedSorts.includes(query['sortBy'])) {
    errors.push(`Unknown sort field: ${query['sortBy']}. Allowed sorts: ${allowedSorts.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    allowedFilters,
    allowedSorts
  };
}

/**
 * Parse and validate pagination parameters
 */
export function parsePaginationParams(query: Record<string, any>) {
  const page = parseInt(query['page'] as string) || 1;
  const pageSize = parseInt(query['pageSize'] as string) || 25;
  
  // Validate pagination limits
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  
  if (pageSize < 1 || pageSize > 1000) {
    throw new Error('Page size must be between 1 and 1000');
  }
  
  return { page, pageSize };
}

/**
 * Build database query with pagination
 */
export function buildPaginationQuery(
  baseQuery: any,
  page: number,
  pageSize: number,
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const offset = getPaginationOffset(page, pageSize);
  
  let query = baseQuery.limit(pageSize).offset(offset);
  
  if (sortBy) {
    query = query.orderBy(sortBy, sortOrder);
  }
  
  return query;
}

/**
 * Resource-specific filter schemas
 */

// User filters
export const UserFilterSchema = CommonFilterSchema.extend({
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  organizationId: z.string().uuid().optional(),
});

export const USER_ALLOWED_FILTERS = ['role', 'status', 'organizationId'];
export const USER_ALLOWED_SORTS = ['createdAt', 'email', 'firstName', 'lastName'];

// Quote filters
export const QuoteFilterSchema = CommonFilterSchema.extend({
  status: z.enum(['draft', 'pending', 'approved', 'sent', 'accepted', 'rejected', 'cancelled']).optional(),
  customerId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});

export const QUOTE_ALLOWED_FILTERS = ['status', 'customerId', 'projectId', 'validFrom', 'validUntil'];
export const QUOTE_ALLOWED_SORTS = ['createdAt', 'totalAmount', 'validUntil', 'status'];

// Project filters
export const ProjectFilterSchema = CommonFilterSchema.extend({
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).optional(),
  customerId: z.string().uuid().optional(),
  projectManagerId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export const PROJECT_ALLOWED_FILTERS = ['status', 'customerId', 'projectManagerId', 'priority'];
export const PROJECT_ALLOWED_SORTS = ['createdAt', 'startDate', 'endDate', 'priority'];

// Time entry filters
export const TimeEntryFilterSchema = CommonFilterSchema.extend({
  userId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'invoiced']).optional(),
  billable: z.boolean().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const TIME_ENTRY_ALLOWED_FILTERS = ['userId', 'projectId', 'taskId', 'status', 'billable', 'dateFrom', 'dateTo'];
export const TIME_ENTRY_ALLOWED_SORTS = ['date', 'durationHours', 'createdAt'];

// Payment filters
export const PaymentFilterSchema = CommonFilterSchema.extend({
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
  method: z.string().optional(),
  customerId: z.string().uuid().optional(),
  amountFrom: z.number().optional(),
  amountTo: z.number().optional(),
});

export const PAYMENT_ALLOWED_FILTERS = ['status', 'method', 'customerId', 'amountFrom', 'amountTo'];
export const PAYMENT_ALLOWED_SORTS = ['createdAt', 'amount', 'status'];

// Portal filters
export const PortalFilterSchema = CommonFilterSchema.extend({
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).optional(),
  customerId: z.string().uuid(),
});

export const PORTAL_ALLOWED_FILTERS = ['status', 'customerId'];
export const PORTAL_ALLOWED_SORTS = ['createdAt', 'totalAmount', 'status'];

/**
 * Create filter validation middleware
 */
export function createFilterValidationMiddleware(
  allowedFilters: string[],
  allowedSorts: string[] = []
) {
  return function validateFiltersMiddleware(request: any, reply: any, done: () => void) {
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
 * Standard response serializer for pagination
 */
export function createPaginationSerializer<T>() {
  return function serializePaginationResponse(
    items: T[],
    page: number,
    pageSize: number,
    total: number,
    organizationId?: string
  ) {
    return createPaginationEnvelope(items, page, pageSize, total, organizationId);
  };
}
