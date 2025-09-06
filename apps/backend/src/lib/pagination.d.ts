/**
 * Pagination and Filtering Utilities for C0 Backend Readiness
 * Standard envelope with pagination and filtering validation
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    size: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodString>;
    filter: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    size: number;
    page: number;
    sort?: string | undefined;
    filter?: string | undefined;
}, {
    size?: number | undefined;
    sort?: string | undefined;
    filter?: string | undefined;
    page?: number | undefined;
}>;
export declare const LegacyPaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
}, {
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const CommonFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    sortBy?: string | undefined;
}, {
    search?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
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
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    role: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
    organizationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    organizationId?: string | undefined;
    status?: "active" | "inactive" | "suspended" | undefined;
    role?: string | undefined;
    sortBy?: string | undefined;
}, {
    search?: string | undefined;
    organizationId?: string | undefined;
    status?: "active" | "inactive" | "suspended" | undefined;
    role?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const USER_ALLOWED_FILTERS: string[];
export declare const USER_ALLOWED_SORTS: string[];
export declare const QuoteFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["draft", "pending", "approved", "sent", "accepted", "rejected", "cancelled"]>>;
    customerId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    validFrom: z.ZodOptional<z.ZodString>;
    validUntil: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    status?: "draft" | "pending" | "approved" | "sent" | "accepted" | "rejected" | "cancelled" | undefined;
    customerId?: string | undefined;
    projectId?: string | undefined;
    validFrom?: string | undefined;
    validUntil?: string | undefined;
    sortBy?: string | undefined;
}, {
    search?: string | undefined;
    status?: "draft" | "pending" | "approved" | "sent" | "accepted" | "rejected" | "cancelled" | undefined;
    customerId?: string | undefined;
    projectId?: string | undefined;
    validFrom?: string | undefined;
    validUntil?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const QUOTE_ALLOWED_FILTERS: string[];
export declare const QUOTE_ALLOWED_SORTS: string[];
export declare const ProjectFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["planning", "active", "on-hold", "completed", "cancelled"]>>;
    customerId: z.ZodOptional<z.ZodString>;
    projectManagerId: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    status?: "active" | "completed" | "cancelled" | "planning" | "on-hold" | undefined;
    customerId?: string | undefined;
    priority?: "urgent" | "high" | "low" | "medium" | undefined;
    sortBy?: string | undefined;
    projectManagerId?: string | undefined;
}, {
    search?: string | undefined;
    status?: "active" | "completed" | "cancelled" | "planning" | "on-hold" | undefined;
    customerId?: string | undefined;
    priority?: "urgent" | "high" | "low" | "medium" | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    projectManagerId?: string | undefined;
}>;
export declare const PROJECT_ALLOWED_FILTERS: string[];
export declare const PROJECT_ALLOWED_SORTS: string[];
export declare const TimeEntryFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    userId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    taskId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected", "invoiced"]>>;
    billable: z.ZodOptional<z.ZodBoolean>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    status?: "pending" | "approved" | "rejected" | "invoiced" | undefined;
    userId?: string | undefined;
    projectId?: string | undefined;
    sortBy?: string | undefined;
    taskId?: string | undefined;
    billable?: boolean | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    search?: string | undefined;
    status?: "pending" | "approved" | "rejected" | "invoiced" | undefined;
    userId?: string | undefined;
    projectId?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    taskId?: string | undefined;
    billable?: boolean | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export declare const TIME_ENTRY_ALLOWED_FILTERS: string[];
export declare const TIME_ENTRY_ALLOWED_SORTS: string[];
export declare const PaymentFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["pending", "completed", "failed", "cancelled"]>>;
    method: z.ZodOptional<z.ZodString>;
    customerId: z.ZodOptional<z.ZodString>;
    amountFrom: z.ZodOptional<z.ZodNumber>;
    amountTo: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    status?: "pending" | "failed" | "completed" | "cancelled" | undefined;
    customerId?: string | undefined;
    method?: string | undefined;
    sortBy?: string | undefined;
    amountFrom?: number | undefined;
    amountTo?: number | undefined;
}, {
    search?: string | undefined;
    status?: "pending" | "failed" | "completed" | "cancelled" | undefined;
    customerId?: string | undefined;
    method?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    amountFrom?: number | undefined;
    amountTo?: number | undefined;
}>;
export declare const PAYMENT_ALLOWED_FILTERS: string[];
export declare const PAYMENT_ALLOWED_SORTS: string[];
export declare const PortalFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["draft", "sent", "accepted", "rejected", "expired"]>>;
    customerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    status?: "draft" | "sent" | "accepted" | "rejected" | "expired" | undefined;
    sortBy?: string | undefined;
}, {
    customerId: string;
    search?: string | undefined;
    status?: "draft" | "sent" | "accepted" | "rejected" | "expired" | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
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