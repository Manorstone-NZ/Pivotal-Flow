/**
 * Audit logger compatibility shim
 * Re-exports from shared audit logger or provides minimal implementation
 */
import type { FastifyInstance } from 'fastify';
export interface AuditEvent {
    actorId: string;
    organizationId: string;
    entityType: string;
    entityId: string;
    action: string;
    metadata?: Record<string, unknown>;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
}
export interface IAuditLogger {
    logEvent(event: AuditEvent): Promise<void>;
}
export declare class AuditLogger implements IAuditLogger {
    constructor(_fastify: FastifyInstance, _organizationId: string, _userId: string);
    logEvent(event: AuditEvent): Promise<void>;
}
export declare function auditLog(event: AuditEvent): Promise<void>;
//# sourceMappingURL=logger.d.ts.map