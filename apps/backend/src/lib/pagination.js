/**
 * Pagination and Filtering Utilities for C0 Backend Readiness
 * Standard envelope with pagination and filtering validation
 */
import { z } from 'zod';
// Standard pagination schema - unified format
export const PaginationSchema = z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    size: z.coerce.number().int().min(1, 'Page size must be at least 1').max(100, 'Page size cannot exceed 100').default(25),
    sort: z.string().optional(),
    filter: z.string().optional(),
});
// Legacy pagination schema for backward compatibility during transition
export const LegacyPaginationSchema = z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    pageSize: z.coerce.number().int().min(1, 'Page size must be at least 1').max(100, 'Page size cannot exceed 100').default(25),
});
// Common filter schema
export const CommonFilterSchema = z.object({
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
/**
 * Create standardized pagination envelope
 */
export function createPaginationEnvelope(items, page, size, total, organizationId) {
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
export function createLegacyPaginationEnvelope(items, page, pageSize, total, organizationId) {
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
export function getPaginationOffset(page, size) {
    return (page - 1) * size;
}
/**
 * Type guard to check if value is a record
 */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * Validate filters against allowed filters
 */
export function validateFilters(query, allowedFilters, allowedSorts = []) {
    const errors = [];
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
    const providedFilters = Object.keys(queryObj).filter(key => !['page', 'pageSize', 'search'].includes(key));
    // Check for unknown filters
    const unknownFilters = providedFilters.filter(filter => !allowedFilters.includes(filter) && !filter.startsWith('sort'));
    if (unknownFilters.length > 0) {
        errors.push(`Unknown filters: ${unknownFilters.join(', ')}. Allowed filters: ${allowedFilters.join(', ')}`);
    }
    // Check for unknown sort fields
    if (queryObj['sortBy'] && allowedSorts.length > 0 && !allowedSorts.includes(queryObj['sortBy'])) {
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
export function parsePaginationParams(query) {
    const page = parseInt(query['page']) || 1;
    const size = parseInt(query['size']) || 25;
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
export function parseLegacyPaginationParams(query) {
    const page = parseInt(query['page']) || 1;
    const pageSize = parseInt(query['pageSize']) || 25;
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
export function buildPaginationQuery(baseQuery, page, size, sortBy, sortOrder = 'desc') {
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
export function createFilterValidationMiddleware(allowedFilters, allowedSorts = []) {
    return function validateFiltersMiddleware(request, reply, done) {
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
export function createPaginationSerializer() {
    return function serializePaginationResponse(items, page, size, total, organizationId) {
        return createPaginationEnvelope(items, page, size, total, organizationId);
    };
}
/**
 * Legacy response serializer for pagination - backward compatibility
 */
export function createLegacyPaginationSerializer() {
    return function serializeLegacyPaginationResponse(items, page, pageSize, total, organizationId) {
        return createLegacyPaginationEnvelope(items, page, pageSize, total, organizationId);
    };
}
//# sourceMappingURL=pagination.js.map