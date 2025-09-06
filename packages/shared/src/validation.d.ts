import { z } from 'zod';
export declare const uuidSchema: z.ZodString;
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const usernameSchema: z.ZodString;
export declare const nameSchema: z.ZodString;
export declare const phoneSchema: z.ZodOptional<z.ZodString>;
export declare const urlSchema: z.ZodOptional<z.ZodString>;
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const paginationResponseSchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}>;
export declare const healthCheckSchema: z.ZodObject<{
    status: z.ZodEnum<["ok", "error"]>;
    message: z.ZodOptional<z.ZodString>;
    latency: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "error" | "ok";
    timestamp: string;
    message?: string | undefined;
    latency?: number | undefined;
}, {
    status: "error" | "ok";
    timestamp: string;
    message?: string | undefined;
    latency?: number | undefined;
}>;
export declare const healthStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["ok", "error"]>;
    timestamp: z.ZodString;
    uptime: z.ZodNumber;
    version: z.ZodString;
    checks: z.ZodObject<{
        database: z.ZodObject<{
            status: z.ZodEnum<["ok", "error"]>;
            message: z.ZodOptional<z.ZodString>;
            latency: z.ZodOptional<z.ZodNumber>;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        }, {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        }>;
        redis: z.ZodObject<{
            status: z.ZodEnum<["ok", "error"]>;
            message: z.ZodOptional<z.ZodString>;
            latency: z.ZodOptional<z.ZodNumber>;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        }, {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        }>;
        metrics: z.ZodObject<{
            status: z.ZodEnum<["ok", "error"]>;
            message: z.ZodOptional<z.ZodString>;
            latency: z.ZodOptional<z.ZodNumber>;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        }, {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        database: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
        redis: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
        metrics: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
    }, {
        database: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
        redis: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
        metrics: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    status: "error" | "ok";
    version: string;
    timestamp: string;
    uptime: number;
    checks: {
        database: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
        redis: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
        metrics: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
    };
}, {
    status: "error" | "ok";
    version: string;
    timestamp: string;
    uptime: number;
    checks: {
        database: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
        redis: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
        metrics: {
            status: "error" | "ok";
            timestamp: string;
            message?: string | undefined;
            latency?: number | undefined;
        };
    };
}>;
export declare const apiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    requestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    requestId: string;
    success: boolean;
    timestamp: string;
    data?: unknown;
    error?: string | undefined;
    message?: string | undefined;
}, {
    requestId: string;
    success: boolean;
    timestamp: string;
    data?: unknown;
    error?: string | undefined;
    message?: string | undefined;
}>;
export declare const paginatedApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    requestId: z.ZodString;
} & {
    data: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
}, "strip", z.ZodTypeAny, {
    requestId: string;
    success: boolean;
    timestamp: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    data?: unknown[] | undefined;
    error?: string | undefined;
    message?: string | undefined;
}, {
    requestId: string;
    success: boolean;
    timestamp: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    data?: unknown[] | undefined;
    error?: string | undefined;
    message?: string | undefined;
}>;
export declare const requestContextSchema: z.ZodObject<{
    requestId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    ip: z.ZodString;
    userAgent: z.ZodString;
    timestamp: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    userAgent: string;
    requestId: string;
    timestamp: Date;
    ip: string;
    organizationId?: string | undefined;
    userId?: string | undefined;
}, {
    userAgent: string;
    requestId: string;
    timestamp: Date;
    ip: string;
    organizationId?: string | undefined;
    userId?: string | undefined;
}>;
export declare const logEntrySchema: z.ZodObject<{
    level: z.ZodEnum<["debug", "info", "warn", "error"]>;
    timestamp: z.ZodString;
    requestId: z.ZodString;
    route: z.ZodOptional<z.ZodString>;
    latency: z.ZodOptional<z.ZodNumber>;
    message: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    requestId: string;
    message: string;
    level: "debug" | "error" | "warn" | "info";
    timestamp: string;
    metadata?: Record<string, unknown> | undefined;
    route?: string | undefined;
    latency?: number | undefined;
}, {
    requestId: string;
    message: string;
    level: "debug" | "error" | "warn" | "info";
    timestamp: string;
    metadata?: Record<string, unknown> | undefined;
    route?: string | undefined;
    latency?: number | undefined;
}>;
export declare const databaseConnectionSchema: z.ZodObject<{
    host: z.ZodString;
    port: z.ZodNumber;
    database: z.ZodString;
    username: z.ZodString;
    ssl: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    host: string;
    port: number;
    database: string;
    ssl: boolean;
    username: string;
}, {
    host: string;
    port: number;
    database: string;
    ssl: boolean;
    username: string;
}>;
export declare const redisConnectionSchema: z.ZodObject<{
    host: z.ZodString;
    port: z.ZodNumber;
    password: z.ZodOptional<z.ZodString>;
    db: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    host: string;
    port: number;
    db: number;
    password?: string | undefined;
}, {
    host: string;
    port: number;
    db: number;
    password?: string | undefined;
}>;
export declare const metricsConfigSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    port: z.ZodNumber;
    path: z.ZodString;
    collectDefaultMetrics: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    port: number;
    path: string;
    enabled: boolean;
    collectDefaultMetrics: boolean;
}, {
    port: number;
    path: string;
    enabled: boolean;
    collectDefaultMetrics: boolean;
}>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type PaginationResponse = z.infer<typeof paginationResponseSchema>;
export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type HealthStatus = z.infer<typeof healthStatusSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type PaginatedApiResponse = z.infer<typeof paginatedApiResponseSchema>;
export type RequestContext = z.infer<typeof requestContextSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;
export type DatabaseConnection = z.infer<typeof databaseConnectionSchema>;
export type RedisConnection = z.infer<typeof redisConnectionSchema>;
export type MetricsConfig = z.infer<typeof metricsConfigSchema>;
//# sourceMappingURL=validation.d.ts.map