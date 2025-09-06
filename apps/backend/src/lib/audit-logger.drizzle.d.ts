import type { FastifyRequest, FastifyInstance } from 'fastify';
export interface AuditEvent {
    action: string;
    entityType: string;
    entityId: string;
    organizationId: string;
    userId?: string | null;
    oldValues?: Record<string, unknown> | null;
    newValues?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
}
export declare class AuditLogger {
    private fastify;
    constructor(fastify: FastifyInstance);
    /**
     * Log an audit event using Drizzle ORM
     */
    logEvent(event: AuditEvent, request?: FastifyRequest): Promise<void>;
    /**
     * Log authentication events using Drizzle ORM
     */
    logAuthEvent(action: 'auth.login' | 'auth.login_failed' | 'auth.logout' | 'auth.refresh', organizationId: string, userId: string | null, metadata: Record<string, unknown> | null, request: FastifyRequest): Promise<void>;
}
export declare function createAuditLogger(fastify: FastifyInstance): AuditLogger;
//# sourceMappingURL=audit-logger.drizzle.d.ts.map