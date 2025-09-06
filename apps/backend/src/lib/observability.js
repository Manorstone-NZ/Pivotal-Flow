/**
 * Observability Middleware for C0 Backend Readiness
 * Ensures logs include request_id, user_id, organization_id, route, status, duration
 */
import { register, Counter, Histogram, Gauge } from 'prom-client';
import { config } from '../config/index.js';
// Prometheus metrics
export const metrics = {
    // Request counters
    httpRequestsTotal: new Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code', 'organization_id']
    }),
    // Request duration histogram
    httpRequestDuration: new Histogram({
        name: 'http_request_duration_seconds',
        help: 'HTTP request duration in seconds',
        labelNames: ['method', 'route', 'organization_id'],
        buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10]
    }),
    // Error counters
    httpErrorsTotal: new Counter({
        name: 'http_errors_total',
        help: 'Total number of HTTP errors',
        labelNames: ['method', 'route', 'error_code', 'organization_id']
    }),
    // Database query metrics
    dbQueryDuration: new Histogram({
        name: 'db_query_duration_seconds',
        help: 'Database query duration in seconds',
        labelNames: ['query_type', 'table', 'organization_id'],
        buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]
    }),
    // Slow query counter
    slowQueriesTotal: new Counter({
        name: 'slow_queries_total',
        help: 'Total number of slow queries (>1s)',
        labelNames: ['query_type', 'table', 'organization_id']
    }),
    // Active connections gauge
    activeConnections: new Gauge({
        name: 'active_connections',
        help: 'Number of active connections',
        labelNames: ['organization_id']
    }),
    // Export job metrics
    exportJobsTotal: new Counter({
        name: 'export_jobs_total',
        help: 'Total number of export jobs',
        labelNames: ['report_type', 'status', 'organization_id']
    }),
    exportJobDuration: new Histogram({
        name: 'export_job_duration_seconds',
        help: 'Export job duration in seconds',
        labelNames: ['report_type', 'organization_id'],
        buckets: [30, 60, 120, 300, 600, 1800, 3600]
    }),
    // Authentication metrics
    authAttemptsTotal: new Counter({
        name: 'auth_attempts_total',
        help: 'Total number of authentication attempts',
        labelNames: ['method', 'status', 'organization_id']
    }),
    // Rate limiting metrics
    rateLimitExceededTotal: new Counter({
        name: 'rate_limit_exceeded_total',
        help: 'Total number of rate limit violations',
        labelNames: ['route', 'organization_id']
    })
};
/**
 * Request logging middleware
 */
export function requestLoggingMiddleware(request, reply, done) {
    const startTime = Date.now();
    const requestId = request.id;
    const user = request.user;
    const organizationId = user?.org || 'unknown';
    const userId = user?.sub || 'anonymous';
    // Log request start
    request.log.info({
        message: 'Request started',
        request: {
            id: requestId,
            method: request.method,
            url: request.url,
            userAgent: request.headers['user-agent'],
            ip: request.ip
        },
        user: {
            id: userId,
            organization: organizationId
        },
        timestamp: new Date().toISOString()
    });
    // Track request metrics
    const requestTimer = metrics.httpRequestDuration.startTimer({
        method: request.method,
        route: request.url,
        organization_id: organizationId
    });
    // Override reply.send to capture response data
    const originalSend = reply.send.bind(reply);
    reply.send = function (data) {
        const duration = (Date.now() - startTime) / 1000; // Convert to seconds
        const statusCode = reply.statusCode;
        // Stop the timer
        requestTimer();
        // Increment request counter
        metrics.httpRequestsTotal.inc({
            method: request.method,
            route: request.url,
            status_code: statusCode,
            organization_id: organizationId
        });
        // Increment error counter if status code indicates error
        if (statusCode >= 400) {
            metrics.httpErrorsTotal.inc({
                method: request.method,
                route: request.url,
                error_code: statusCode,
                organization_id: organizationId
            });
        }
        // Log request completion
        request.log.info({
            message: 'Request completed',
            request: {
                id: requestId,
                method: request.method,
                url: request.url,
                duration: duration,
                statusCode: statusCode
            },
            user: {
                id: userId,
                organization: organizationId
            },
            response: {
                statusCode: statusCode,
                size: JSON.stringify(data).length
            },
            timestamp: new Date().toISOString()
        });
        return originalSend(data);
    };
    done();
}
/**
 * Database query monitoring middleware
 */
export function databaseMonitoringMiddleware(query, params, startTime) {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const queryType = getQueryType(query);
    const table = getTableFromQuery(query);
    const organizationId = getOrganizationFromParams(params) ?? 'unknown';
    // Record query duration
    metrics.dbQueryDuration.observe({
        query_type: queryType,
        table: table,
        organization_id: organizationId
    }, duration);
    // Track slow queries
    if (duration > 1) {
        metrics.slowQueriesTotal.inc({
            query_type: queryType,
            table: table,
            organization_id: organizationId
        });
    }
}
/**
 * Export job monitoring
 */
export function exportJobMonitoring(reportType, status, duration, organizationId) {
    // Increment export job counter
    metrics.exportJobsTotal.inc({
        report_type: reportType,
        status: status,
        organization_id: organizationId
    });
    // Record export job duration if completed
    if (status === 'completed') {
        metrics.exportJobDuration.observe({
            report_type: reportType,
            organization_id: organizationId
        }, duration);
    }
}
/**
 * Authentication monitoring
 */
export function authMonitoring(method, status, organizationId) {
    metrics.authAttemptsTotal.inc({
        method: method,
        status: status,
        organization_id: organizationId
    });
}
/**
 * Rate limit monitoring
 */
export function rateLimitMonitoring(route, organizationId) {
    metrics.rateLimitExceededTotal.inc({
        route: route,
        organization_id: organizationId
    });
}
/**
 * Connection monitoring
 */
export function connectionMonitoring(organizationId, connected) {
    if (connected) {
        metrics.activeConnections.inc({ organization_id: organizationId });
    }
    else {
        metrics.activeConnections.dec({ organization_id: organizationId });
    }
}
/**
 * Helper functions
 */
function getQueryType(query) {
    const upperQuery = query.trim().toUpperCase();
    if (upperQuery.startsWith('SELECT'))
        return 'SELECT';
    if (upperQuery.startsWith('INSERT'))
        return 'INSERT';
    if (upperQuery.startsWith('UPDATE'))
        return 'UPDATE';
    if (upperQuery.startsWith('DELETE'))
        return 'DELETE';
    return 'OTHER';
}
function getTableFromQuery(query) {
    const match = query.match(/FROM\s+(\w+)|UPDATE\s+(\w+)|INSERT\s+INTO\s+(\w+)/i);
    return match ? (match[1] || match[2] || match[3] || 'unknown') : 'unknown';
}
function getOrganizationFromParams(params) {
    // Look for organization ID in params
    for (const param of params) {
        if (typeof param === 'object' && param !== null && 'organizationId' in param) {
            return param.organizationId;
        }
        if (typeof param === 'string' && param.includes('org_')) {
            return param;
        }
    }
    return undefined;
}
/**
 * Metrics endpoint middleware
 */
export function metricsEndpointMiddleware(_request, reply) {
    reply.header('Content-Type', register.contentType);
    reply.send(register.metrics());
}
/**
 * Health check middleware with detailed metrics
 */
export function healthCheckMiddleware(_request, reply) {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        metrics: {
            totalRequests: metrics.httpRequestsTotal.get(),
            totalErrors: metrics.httpErrorsTotal.get(),
            activeConnections: metrics.activeConnections.get()
        }
    };
    reply.send(health);
}
/**
 * Structured logging configuration
 */
export const loggingConfig = {
    level: config.server.LOG_LEVEL,
    serializers: {
        req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            userAgent: req.headers?.['user-agent'],
            ip: req.ip
        }),
        res: (res) => ({
            statusCode: res.statusCode
        }),
        err: (err) => ({
            type: err.type,
            message: err.message,
            stack: err.stack
        })
    },
    formatters: {
        level: (label) => ({ level: label }),
        log: (object) => {
            if (typeof object !== 'object' || object === null) {
                return {
                    message: String(object),
                    timestamp: new Date().toISOString(),
                    service: 'pivotal-flow-api',
                    version: '1.0.0'
                };
            }
            return {
                ...object,
                timestamp: new Date().toISOString(),
                service: 'pivotal-flow-api',
                version: '1.0.0'
            };
        }
    }
};
/**
 * Error logging middleware
 */
export function errorLoggingMiddleware(error, request, _reply) {
    const user = request.user;
    const organizationId = user?.org || 'unknown';
    const userId = user?.sub || 'anonymous';
    // Type guard to check if error is an Error object
    const errorObj = error instanceof Error ? error : new Error(String(error));
    request.log.error({
        message: 'Request error',
        error: {
            name: errorObj.name,
            message: errorObj.message,
            stack: errorObj.stack,
            code: errorObj.code || 'UNKNOWN_ERROR'
        },
        request: {
            id: request.id,
            method: request.method,
            url: request.url,
            userAgent: request.headers['user-agent'],
            ip: request.ip
        },
        user: {
            id: userId,
            organization: organizationId
        },
        timestamp: new Date().toISOString()
    });
    // Increment error metric
    metrics.httpErrorsTotal.inc({
        method: request.method,
        route: request.url,
        error_code: errorObj.statusCode || 500,
        organization_id: organizationId
    });
}
//# sourceMappingURL=observability.js.map