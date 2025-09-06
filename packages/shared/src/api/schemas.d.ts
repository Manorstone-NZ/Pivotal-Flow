import { z } from 'zod';
export declare const PagingRequestSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
}, {
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const PagingResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodAny, "many">;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    items: any[];
    total: number;
    totalPages: number;
}, {
    page: number;
    pageSize: number;
    items: any[];
    total: number;
    totalPages: number;
}>;
export declare const FilterStringSchema: z.ZodObject<{
    field: z.ZodString;
    value: z.ZodString;
    operator: z.ZodDefault<z.ZodEnum<["eq", "ne", "contains", "startsWith", "endsWith"]>>;
}, "strip", z.ZodTypeAny, {
    value: string;
    field: string;
    operator: "endsWith" | "startsWith" | "contains" | "eq" | "ne";
}, {
    value: string;
    field: string;
    operator?: "endsWith" | "startsWith" | "contains" | "eq" | "ne" | undefined;
}>;
export declare const FilterBooleanSchema: z.ZodObject<{
    field: z.ZodString;
    value: z.ZodBoolean;
    operator: z.ZodDefault<z.ZodEnum<["eq"]>>;
}, "strip", z.ZodTypeAny, {
    value: boolean;
    field: string;
    operator: "eq";
}, {
    value: boolean;
    field: string;
    operator?: "eq" | undefined;
}>;
export declare const FilterNumberSchema: z.ZodObject<{
    field: z.ZodString;
    value: z.ZodNumber;
    operator: z.ZodDefault<z.ZodEnum<["eq", "ne", "gt", "gte", "lt", "lte"]>>;
}, "strip", z.ZodTypeAny, {
    value: number;
    field: string;
    operator: "eq" | "gt" | "gte" | "lt" | "lte" | "ne";
}, {
    value: number;
    field: string;
    operator?: "eq" | "gt" | "gte" | "lt" | "lte" | "ne" | undefined;
}>;
export declare const DateRangeSchema: z.ZodObject<{
    field: z.ZodString;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    field: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    field: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const SortSchema: z.ZodObject<{
    field: z.ZodString;
    direction: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    field: string;
    direction: "asc" | "desc";
}, {
    field: string;
    direction?: "asc" | "desc" | undefined;
}>;
export declare const FiltersSchema: z.ZodObject<{
    stringFilters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        value: z.ZodString;
        operator: z.ZodDefault<z.ZodEnum<["eq", "ne", "contains", "startsWith", "endsWith"]>>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        field: string;
        operator: "endsWith" | "startsWith" | "contains" | "eq" | "ne";
    }, {
        value: string;
        field: string;
        operator?: "endsWith" | "startsWith" | "contains" | "eq" | "ne" | undefined;
    }>, "many">>;
    booleanFilters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        value: z.ZodBoolean;
        operator: z.ZodDefault<z.ZodEnum<["eq"]>>;
    }, "strip", z.ZodTypeAny, {
        value: boolean;
        field: string;
        operator: "eq";
    }, {
        value: boolean;
        field: string;
        operator?: "eq" | undefined;
    }>, "many">>;
    numberFilters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        value: z.ZodNumber;
        operator: z.ZodDefault<z.ZodEnum<["eq", "ne", "gt", "gte", "lt", "lte"]>>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        field: string;
        operator: "eq" | "gt" | "gte" | "lt" | "lte" | "ne";
    }, {
        value: number;
        field: string;
        operator?: "eq" | "gt" | "gte" | "lt" | "lte" | "ne" | undefined;
    }>, "many">>;
    dateRanges: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        field: string;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }>, "many">>;
    sorts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        direction: "asc" | "desc";
    }, {
        field: string;
        direction?: "asc" | "desc" | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    stringFilters?: {
        value: string;
        field: string;
        operator: "endsWith" | "startsWith" | "contains" | "eq" | "ne";
    }[] | undefined;
    booleanFilters?: {
        value: boolean;
        field: string;
        operator: "eq";
    }[] | undefined;
    numberFilters?: {
        value: number;
        field: string;
        operator: "eq" | "gt" | "gte" | "lt" | "lte" | "ne";
    }[] | undefined;
    dateRanges?: {
        field: string;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }[] | undefined;
    sorts?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
}, {
    stringFilters?: {
        value: string;
        field: string;
        operator?: "endsWith" | "startsWith" | "contains" | "eq" | "ne" | undefined;
    }[] | undefined;
    booleanFilters?: {
        value: boolean;
        field: string;
        operator?: "eq" | undefined;
    }[] | undefined;
    numberFilters?: {
        value: number;
        field: string;
        operator?: "eq" | "gt" | "gte" | "lt" | "lte" | "ne" | undefined;
    }[] | undefined;
    dateRanges?: {
        field: string;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }[] | undefined;
    sorts?: {
        field: string;
        direction?: "asc" | "desc" | undefined;
    }[] | undefined;
}>;
export type PagingRequest = z.infer<typeof PagingRequestSchema>;
export type PagingResponse<T> = z.infer<typeof PagingResponseSchema> & {
    items: T[];
};
export type FilterString = z.infer<typeof FilterStringSchema>;
export type FilterBoolean = z.infer<typeof FilterBooleanSchema>;
export type FilterNumber = z.infer<typeof FilterNumberSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type Sort = z.infer<typeof SortSchema>;
export type Filters = z.infer<typeof FiltersSchema>;
export declare const createStringFilter: (field: string, value: string, operator?: "eq" | "ne" | "contains" | "startsWith" | "endsWith") => FilterString;
export declare const createBooleanFilter: (field: string, value: boolean) => FilterBoolean;
export declare const createNumberFilter: (field: string, value: number, operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte") => FilterNumber;
export declare const createDateRange: (field: string, startDate?: string, endDate?: string) => DateRange;
export declare const createSort: (field: string, direction?: "asc" | "desc") => Sort;
export declare const calculateTotalPages: (total: number, pageSize: number) => number;
export declare const createPagingResponse: <T>(items: T[], page: number, pageSize: number, total: number) => PagingResponse<T>;
//# sourceMappingURL=schemas.d.ts.map