import { z } from 'zod';
// Base paging request schema
export const PagingRequestSchema = z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20)
});
// Base paging response schema
export const PagingResponseSchema = z.object({
    items: z.array(z.any()),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number()
});
// Filter schemas
export const FilterStringSchema = z.object({
    field: z.string(),
    value: z.string(),
    operator: z.enum(['eq', 'ne', 'contains', 'startsWith', 'endsWith']).default('eq')
});
export const FilterBooleanSchema = z.object({
    field: z.string(),
    value: z.boolean(),
    operator: z.enum(['eq']).default('eq')
});
export const FilterNumberSchema = z.object({
    field: z.string(),
    value: z.number(),
    operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte']).default('eq')
});
export const DateRangeSchema = z.object({
    field: z.string(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
});
// Sort schema
export const SortSchema = z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']).default('asc')
});
// Combined filters schema
export const FiltersSchema = z.object({
    stringFilters: z.array(FilterStringSchema).optional(),
    booleanFilters: z.array(FilterBooleanSchema).optional(),
    numberFilters: z.array(FilterNumberSchema).optional(),
    dateRanges: z.array(DateRangeSchema).optional(),
    sorts: z.array(SortSchema).optional()
});
// Helper functions for building filters
export const createStringFilter = (field, value, operator = 'eq') => ({
    field,
    value,
    operator
});
export const createBooleanFilter = (field, value) => ({
    field,
    value,
    operator: 'eq'
});
export const createNumberFilter = (field, value, operator = 'eq') => ({
    field,
    value,
    operator
});
export const createDateRange = (field, startDate, endDate) => ({
    field,
    startDate,
    endDate
});
export const createSort = (field, direction = 'asc') => ({
    field,
    direction
});
// Helper function to calculate total pages
export const calculateTotalPages = (total, pageSize) => {
    return Math.ceil(total / pageSize);
};
// Helper function to create paging response
export const createPagingResponse = (items, page, pageSize, total) => ({
    items,
    page,
    pageSize,
    total,
    totalPages: calculateTotalPages(total, pageSize)
});
//# sourceMappingURL=schemas.js.map