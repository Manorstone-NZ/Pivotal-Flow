/**
 * Simple Audit Logging
 * Basic audit logging using the existing audit_logs table
 */
import type { FastifyInstance } from 'fastify';
export interface SimpleAuditEntry {
    organizationId: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
}
export declare class SimpleAuditLogger {
    private fastify;
    constructor(fastify: FastifyInstance);
    log(entry: SimpleAuditEntry): Promise<void>;
    logPermissionCheck(data: {
        userId: string;
        organizationId: string;
        action: string;
        requiredPermission: string;
        route: string;
        success: boolean;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void>;
    logAuthentication(data: {
        userId: string;
        userEmail: string;
        organizationId: string;
        action: 'login' | 'logout' | 'login_failed';
        ipAddress?: string;
        userAgent?: string;
        success: boolean;
        errorMessage?: string;
    }): Promise<void>;
    logDataAccess(data: {
        userId: string;
        organizationId: string;
        action: string;
        resource: string;
        resourceId?: string;
        recordCount?: number;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void>;
}
//# sourceMappingURL=simple-audit.d.ts.map