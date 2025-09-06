export class AuditLogger {
    fastify;
    options;
    constructor(fastify, options) {
        this.fastify = fastify;
        this.options = options;
    }
    async logEvent(event) {
        try {
            const auditRecord = {
                id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                action: event.action,
                entityType: event.entityType,
                entityId: event.entityId,
                organizationId: event.organizationId,
                userId: event.userId || this.options.userId,
                oldValues: event.oldValues ? JSON.stringify(event.oldValues) : null,
                newValues: event.newValues ? JSON.stringify(event.newValues) : null,
                metadata: event.metadata ? JSON.stringify(event.metadata) : null,
                timestamp: event.timestamp || new Date(),
                createdAt: new Date()
            };
            // For now, log to console - in production this would go to database
            this.fastify.log.info({
                message: 'Audit event',
                ...auditRecord
            });
            // TODO: Implement database storage
            // await this.fastify.db.insert(auditLogs).values(auditRecord);
        }
        catch (error) {
            this.fastify.log.error({ error }, 'Audit logging failed');
        }
    }
    async logUserAction(action, details = {}) {
        await this.logEvent({
            action,
            entityType: 'user',
            entityId: this.options.userId,
            organizationId: this.options.organizationId,
            userId: this.options.userId,
            metadata: details
        });
    }
    async logDataAccess(entityType, entityId, operation) {
        await this.logEvent({
            action: `data.${operation}`,
            entityType,
            entityId,
            organizationId: this.options.organizationId,
            userId: this.options.userId,
            metadata: { operation }
        });
    }
}
//# sourceMappingURL=logger.js.map