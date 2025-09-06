import type { FastifyInstance } from 'fastify';
export interface AuditEvent {
    action: string;
    entityType: string;
    entityId: string;
    organizationId: string;
    userId: string | null;
    oldValues?: Record<string, any> | null;
    newValues?: Record<string, any> | null;
    metadata?: Record<string, unknown>;
    timestamp?: Date;
}
export interface AuditLoggerOptions {
    organizationId: string;
    userId: string;
}
export declare class AuditLogger {
    private fastify;
    private options;
    constructor(fastify: FastifyInstance, options: AuditLoggerOptions);
    logEvent(event: AuditEvent): Promise<void>;
    logUserAction(action: string, details?: Record<string, any>): Promise<void>;
    logDataAccess(entityType: string, entityId: string, operation: 'read' | 'write' | 'delete'): Promise<void>;
}
//# sourceMappingURL=logger.d.ts.map