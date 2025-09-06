/**
 * Observability Middleware for C0 Backend Readiness
 * Ensures logs include request_id, user_id, organization_id, route, status, duration
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { Counter, Histogram, Gauge } from 'prom-client';
export declare const metrics: {
    httpRequestsTotal: Counter<"organization_id" | "route" | "method" | "status_code">;
    httpRequestDuration: Histogram<"organization_id" | "route" | "method">;
    httpErrorsTotal: Counter<"organization_id" | "route" | "method" | "error_code">;
    dbQueryDuration: Histogram<"table" | "organization_id" | "query_type">;
    slowQueriesTotal: Counter<"table" | "organization_id" | "query_type">;
    activeConnections: Gauge<"organization_id">;
    exportJobsTotal: Counter<"organization_id" | "status" | "report_type">;
    exportJobDuration: Histogram<"organization_id" | "report_type">;
    authAttemptsTotal: Counter<"organization_id" | "status" | "method">;
    rateLimitExceededTotal: Counter<"organization_id" | "route">;
};
/**
 * Request logging middleware
 */
export declare function requestLoggingMiddleware(request: FastifyRequest, reply: FastifyReply, done: () => void): void;
/**
 * Database query monitoring middleware
 */
export declare function databaseMonitoringMiddleware(query: string, params: unknown[], startTime: number): void;
/**
 * Export job monitoring
 */
export declare function exportJobMonitoring(reportType: string, status: string, duration: number, organizationId: string): void;
/**
 * Authentication monitoring
 */
export declare function authMonitoring(method: string, status: 'success' | 'failure', organizationId: string): void;
/**
 * Rate limit monitoring
 */
export declare function rateLimitMonitoring(route: string, organizationId: string): void;
/**
 * Connection monitoring
 */
export declare function connectionMonitoring(organizationId: string, connected: boolean): void;
/**
 * Metrics endpoint middleware
 */
export declare function metricsEndpointMiddleware(_request: FastifyRequest, reply: FastifyReply): void;
/**
 * Health check middleware with detailed metrics
 */
export declare function healthCheckMiddleware(_request: FastifyRequest, reply: FastifyReply): void;
/**
 * Structured logging configuration
 */
export declare const loggingConfig: {
    level: "debug" | "fatal" | "error" | "warn" | "info" | "trace";
    serializers: {
        req: (req: unknown) => {
            id: string | undefined;
            method: string | undefined;
            url: string | undefined;
            userAgent: string | undefined;
            ip: string | undefined;
        };
        res: (res: unknown) => {
            statusCode: number | undefined;
        };
        err: (err: unknown) => {
            type: string | undefined;
            message: string | undefined;
            stack: string | undefined;
        };
    };
    formatters: {
        level: (label: string) => {
            level: string;
        };
        log: (object: unknown) => {
            message: string;
            timestamp: string;
            service: string;
            version: string;
        } | {
            timestamp: string;
            service: string;
            version: string;
            message?: never;
        };
    };
};
/**
 * Error logging middleware
 */
export declare function errorLoggingMiddleware(error: unknown, request: FastifyRequest, _reply: FastifyReply): void;
//# sourceMappingURL=observability.d.ts.map