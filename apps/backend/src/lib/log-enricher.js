import { config } from '../config/index.js';
export class LogEnricher {
    /**
     * Enriches a request logger with authentication context
     */
    static enrichRequestLogger(request, logger, context = {}) {
        const enrichedContext = {
            ...context,
            route: request.routeOptions.url,
            userAgent: request.headers['user-agent'],
            ip: request.ip,
        };
        // Extract user and organization from JWT token if available
        if (request.user && typeof request.user === 'object' && 'id' in request.user) {
            enrichedContext.userId = request.user.id;
            enrichedContext.organizationId = request.user.organizationId;
        }
        // Extract from headers if available (for API keys, etc.)
        if (!enrichedContext.userId && request.headers['x-user-id']) {
            enrichedContext.userId = request.headers['x-user-id'];
        }
        if (!enrichedContext.organizationId && request.headers['x-organization-id']) {
            enrichedContext.organizationId = request.headers['x-organization-id'];
        }
        return logger.child(enrichedContext);
    }
    /**
     * Enriches response logging with status and duration
     */
    static enrichResponseLogger(_request, reply, logger, startTime) {
        const duration = Date.now() - startTime;
        const status = reply.statusCode;
        return logger.child({
            status,
            duration,
            type: 'response',
        });
    }
    /**
     * Creates a structured log entry for cloud destinations
     */
    static createCloudLogEntry(level, message, context, additionalData = {}) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: 'pivotal-flow-backend',
            version: '0.1.0',
            ...context,
            ...additionalData,
        };
    }
    /**
     * Formats logs for cloud shipping (JSON without pretty formatting)
     */
    static isCloudShippingEnabled() {
        return config.server.LOG_CLOUD_SHIPPING;
    }
}
//# sourceMappingURL=log-enricher.js.map