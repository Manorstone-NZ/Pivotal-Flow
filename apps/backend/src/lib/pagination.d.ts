/**
 * Pagination and Filtering Utilities for C0 Backend Readiness
 * Standard envelope with pagination and filtering validation
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
export declare const PaginationSchema: import("@sinclair/typebox").TObject<{
    page: import("@sinclair/typebox").TNumber;
    size: import("@sinclair/typebox").TNumber;
    sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    filter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const LegacyPaginationSchema: import("@sinclair/typebox").TObject<{
    page: import("@sinclair/typebox").TNumber;
    pageSize: import("@sinclair/typebox").TNumber;
}>;
export declare const CommonFilterSchema: import("@sinclair/typebox").TObject<{
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortOrder: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
}>;
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
export interface FilterValidationResult {
    isValid: boolean;
    errors: string[];
    allowedFilters: string[];
    allowedSorts: string[];
}
/**
 * Create standardized pagination envelope
 */
export declare function createPaginationEnvelope<T>(items: T[], page: number, size: number, total: number, organizationId?: string): PaginationEnvelope<T>;
/**
 * Create legacy pagination envelope for backward compatibility
 */
export declare function createLegacyPaginationEnvelope<T>(items: T[], page: number, pageSize: number, total: number, organizationId?: string): LegacyPaginationEnvelope<T>;
/**
 * Calculate pagination offset
 */
export declare function getPaginationOffset(page: number, size: number): number;
/**
 * Validate filters against allowed filters
 */
export declare function validateFilters(query: unknown, allowedFilters: string[], allowedSorts?: string[]): FilterValidationResult;
/**
 * Parse and validate pagination parameters - unified format
 */
export declare function parsePaginationParams(query: Record<string, unknown>): {
    page: number;
    size: number;
};
/**
 * Parse and validate legacy pagination parameters
 */
export declare function parseLegacyPaginationParams(query: Record<string, unknown>): {
    page: number;
    pageSize: number;
};
/**
 * Build database query with pagination - unified format
 */
export declare function buildPaginationQuery<T extends {
    limit: (n: number) => T;
    offset: (n: number) => T;
    orderBy: (field: string, order: string) => T;
}>(baseQuery: T, page: number, size: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): T;
/**
 * Resource-specific filter schemas
 */
export declare const UserFilterSchema: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortOrder: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
}>, import("@sinclair/typebox").TObject<{
    role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"inactive">, import("@sinclair/typebox").TLiteral<"suspended">]>>;
    organizationId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>]>;
export declare const USER_ALLOWED_FILTERS: string[];
export declare const USER_ALLOWED_SORTS: string[];
export declare const QuoteFilterSchema: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortOrder: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
}>, import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"accepted">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"cancelled">]>>;
    customerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    projectId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    validFrom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>]>;
export declare const QUOTE_ALLOWED_FILTERS: string[];
export declare const QUOTE_ALLOWED_SORTS: string[];
export declare const ProjectFilterSchema: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortOrder: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
}>, import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"planning">, import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"on-hold">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"cancelled">]>>;
    customerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    projectManagerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    priority: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"low">, import("@sinclair/typebox").TLiteral<"medium">, import("@sinclair/typebox").TLiteral<"high">, import("@sinclair/typebox").TLiteral<"urgent">]>>;
}>]>;
export declare const PROJECT_ALLOWED_FILTERS: string[];
export declare const PROJECT_ALLOWED_SORTS: string[];
export declare const TimeEntryFilterSchema: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortOrder: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
}>, import("@sinclair/typebox").TObject<{
    userId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    projectId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    taskId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"invoiced">]>>;
    billable: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    dateFrom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    dateTo: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>]>;
export declare const TIME_ENTRY_ALLOWED_FILTERS: string[];
export declare const TIME_ENTRY_ALLOWED_SORTS: string[];
export declare const PaymentFilterSchema: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortOrder: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
}>, import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"failed">, import("@sinclair/typebox").TLiteral<"cancelled">]>>;
    method: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    customerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    amountFrom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    amountTo: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>]>;
export declare const PAYMENT_ALLOWED_FILTERS: string[];
export declare const PAYMENT_ALLOWED_SORTS: string[];
export declare const PortalFilterSchema: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortOrder: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
}>, import("@sinclair/typebox").TObject<{
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"accepted">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"expired">]>>;
    customerId: import("@sinclair/typebox").TString;
}>]>;
export declare const PORTAL_ALLOWED_FILTERS: string[];
export declare const PORTAL_ALLOWED_SORTS: string[];
/**
 * Create filter validation middleware
 */
export declare function createFilterValidationMiddleware(allowedFilters: string[], allowedSorts?: string[]): (request: FastifyRequest, reply: FastifyReply, done: () => void) => void;
/**
 * Standard response serializer for pagination - unified format
 */
export declare function createPaginationSerializer<T>(): (items: T[], page: number, size: number, total: number, organizationId?: string) => PaginationEnvelope<T>;
/**
 * Legacy response serializer for pagination - backward compatibility
 */
export declare function createLegacyPaginationSerializer<T>(): (items: T[], page: number, pageSize: number, total: number, organizationId?: string) => LegacyPaginationEnvelope<T>;
//# sourceMappingURL=pagination.d.ts.map