/**
 * Pagination and Filtering Utilities for C0 Backend Readiness
 * Standard envelope with pagination and filtering validation
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    size: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sort: z.ZodOptional<z.ZodString>;
    filter: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const LegacyPaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    pageSize: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const CommonFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
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
export declare function parsePaginationParams(query: Record<string, any>): {
    page: number;
    size: number;
};
/**
 * Parse and validate legacy pagination parameters
 */
export declare function parseLegacyPaginationParams(query: Record<string, any>): {
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
export declare const UserFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    role: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        inactive: "inactive";
        suspended: "suspended";
    }>>;
    organizationId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const USER_ALLOWED_FILTERS: string[];
export declare const USER_ALLOWED_SORTS: string[];
export declare const QuoteFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        pending: "pending";
        sent: "sent";
        approved: "approved";
        accepted: "accepted";
        rejected: "rejected";
        cancelled: "cancelled";
    }>>;
    customerId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    validFrom: z.ZodOptional<z.ZodString>;
    validUntil: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const QUOTE_ALLOWED_FILTERS: string[];
export declare const QUOTE_ALLOWED_SORTS: string[];
export declare const ProjectFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        completed: "completed";
        cancelled: "cancelled";
        planning: "planning";
        "on-hold": "on-hold";
    }>>;
    customerId: z.ZodOptional<z.ZodString>;
    projectManagerId: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<{
        urgent: "urgent";
        high: "high";
        low: "low";
        medium: "medium";
    }>>;
}, z.core.$strip>;
export declare const PROJECT_ALLOWED_FILTERS: string[];
export declare const PROJECT_ALLOWED_SORTS: string[];
export declare const TimeEntryFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    userId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    taskId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        approved: "approved";
        rejected: "rejected";
        invoiced: "invoiced";
    }>>;
    billable: z.ZodOptional<z.ZodBoolean>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const TIME_ENTRY_ALLOWED_FILTERS: string[];
export declare const TIME_ENTRY_ALLOWED_SORTS: string[];
export declare const PaymentFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        failed: "failed";
        completed: "completed";
        cancelled: "cancelled";
    }>>;
    method: z.ZodOptional<z.ZodString>;
    customerId: z.ZodOptional<z.ZodString>;
    amountFrom: z.ZodOptional<z.ZodNumber>;
    amountTo: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const PAYMENT_ALLOWED_FILTERS: string[];
export declare const PAYMENT_ALLOWED_SORTS: string[];
export declare const PortalFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        sent: "sent";
        accepted: "accepted";
        rejected: "rejected";
        expired: "expired";
    }>>;
    customerId: z.ZodString;
}, z.core.$strip>;
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