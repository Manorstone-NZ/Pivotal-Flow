/**
 * Audit logger interface and implementation
 * Provides structured audit logging functionality
 */
/**
 * Default audit logger implementation
 * Uses structured logging via the existing logger
 */
export class DefaultAuditLogger {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    async log(event) {
        this.logger.info({
            type: 'audit',
            actorId: event.actorId,
            organisationId: event.organisationId,
            entityType: event.entityType,
            entityId: event.entityId,
            action: event.action,
            metadata: event.metadata,
            timestamp: event.createdAt?.toISOString() ?? new Date().toISOString()
        });
    }
}
/**
 * No-op audit logger for testing
 */
export class NoOpAuditLogger {
    async log(_event) {
        // No-op implementation
    }
}
//# sourceMappingURL=logger.js.map