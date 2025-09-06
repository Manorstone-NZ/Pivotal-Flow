import { generateId } from '@pivotal-flow/shared';
import { auditLogs } from './schema.js';
export class AuditLogger {
    fastify;
    constructor(fastify) {
        this.fastify = fastify;
    }
    /**
     * Log an audit event using Drizzle ORM
     */
    async logEvent(event, request) {
        try {
            const data = {
                id: generateId(),
                action: event.action,
                entityType: event.entityType,
                entityId: event.entityId,
                organizationId: event.organizationId,
                userId: event.userId ?? null,
                ipAddress: request?.ip ?? null,
                userAgent: request?.headers?.['user-agent'] ?? null,
                sessionId: request?.user?.jti ?? null,
                oldValues: event.oldValues,
                newValues: event.newValues,
                metadata: event.metadata ?? {},
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await this.fastify.db
                .insert(auditLogs)
                .values(data);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to log audit event:', error);
        }
    }
    /**
     * Log authentication events using Drizzle ORM
     */
    async logAuthEvent(action, organizationId, userId, metadata, request) {
        await this.logEvent({
            action,
            entityType: 'user',
            entityId: userId ?? 'unknown',
            organizationId,
            userId,
            metadata: metadata ?? {},
        }, request);
    }
}
export function createAuditLogger(fastify) {
    return new AuditLogger(fastify);
}
//# sourceMappingURL=audit-logger.drizzle.js.map