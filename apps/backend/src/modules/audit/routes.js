/**
 * Audit Log Routes
 * Provides audit log viewing for tenant administrators
 * Ensures full traceability of system actions
 */
import { Type } from '@sinclair/typebox';
import { logger } from "../../lib/logger.js";
import { auditLogs } from "../../lib/schema.js";
import { eq, and, desc, gte, lte, like } from 'drizzle-orm';
// TypeBox schemas for audit log endpoints
const AuditLogQuerySchema = Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 50 })),
    action: Type.Optional(Type.String()),
    entityType: Type.Optional(Type.String()),
    userId: Type.Optional(Type.String()),
    startDate: Type.Optional(Type.String({ format: 'date-time' })),
    endDate: Type.Optional(Type.String({ format: 'date-time' }))
});
const AuditLogResponseSchema = Type.Object({
    logs: Type.Array(Type.Object({
        id: Type.String(),
        action: Type.String(),
        entityType: Type.String(),
        entityId: Type.String(),
        organizationId: Type.String(),
        userId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
        ipAddress: Type.Optional(Type.Union([Type.String(), Type.Null()])),
        userAgent: Type.Optional(Type.Union([Type.String(), Type.Null()])),
        sessionId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
        oldValues: Type.Optional(Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()])),
        newValues: Type.Optional(Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()])),
        metadata: Type.Optional(Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()])),
        createdAt: Type.String()
    })),
    pagination: Type.Object({
        page: Type.Number(),
        limit: Type.Number(),
        total: Type.Number(),
        totalPages: Type.Number()
    })
});
export const auditRoutes = async (fastify) => {
    // Get audit logs for tenant administrators
    fastify.get("/logs", {
        schema: {
            querystring: AuditLogQuerySchema,
            response: {
                200: AuditLogResponseSchema,
                401: Type.Object({
                    error: Type.String(),
                    message: Type.String(),
                    code: Type.String()
                }),
                403: Type.Object({
                    error: Type.String(),
                    message: Type.String(),
                    code: Type.String()
                }),
                500: Type.Object({
                    error: Type.String(),
                    message: Type.String(),
                    code: Type.String()
                })
            }
        }
    }, async (request, reply) => {
        try {
            // Extract session to verify user permissions
            const sessionId = extractSessionId(request);
            if (!sessionId) {
                return reply.status(401).send({
                    error: "Unauthorized",
                    message: "No active session",
                    code: "NO_SESSION"
                });
            }
            // Validate session and get user context
            const cache = fastify.cache;
            const sessionDataStr = await cache.get(`session:${sessionId}`);
            if (!sessionDataStr) {
                return reply.status(401).send({
                    error: "Unauthorized",
                    message: "Invalid session",
                    code: "INVALID_SESSION"
                });
            }
            const sessionData = JSON.parse(sessionDataStr);
            // Check if user has admin permissions for audit logs
            if (!sessionData.permissions?.includes('audit.view_logs') &&
                !sessionData.roles?.includes('Platform Admin')) {
                return reply.status(403).send({
                    error: "Forbidden",
                    message: "Insufficient permissions to view audit logs",
                    code: "INSUFFICIENT_PERMISSIONS"
                });
            }
            const { page = 1, limit = 50, action, entityType, userId, startDate, endDate } = request.query;
            const offset = (page - 1) * limit;
            // Build query conditions
            const conditions = [eq(auditLogs.organizationId, sessionData.tenantId)];
            if (action) {
                conditions.push(like(auditLogs.action, `%${action}%`));
            }
            if (entityType) {
                conditions.push(like(auditLogs.entityType, `%${entityType}%`));
            }
            if (userId) {
                conditions.push(eq(auditLogs.userId, userId));
            }
            if (startDate) {
                conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
            }
            if (endDate) {
                conditions.push(lte(auditLogs.createdAt, new Date(endDate)));
            }
            // Get audit logs with pagination
            const db = fastify.db;
            const [logs, totalResult] = await Promise.all([
                db.select()
                    .from(auditLogs)
                    .where(and(...conditions))
                    .orderBy(desc(auditLogs.createdAt))
                    .limit(limit)
                    .offset(offset),
                db.select({ count: auditLogs.id })
                    .from(auditLogs)
                    .where(and(...conditions))
            ]);
            const total = totalResult.length;
            const totalPages = Math.ceil(total / limit);
            // Log audit log access
            const auditLogger = new (await import('../../lib/audit-logger.drizzle.js')).AuditLogger(fastify);
            await auditLogger.logEvent({
                action: 'audit_logs_viewed',
                entityType: 'audit_logs',
                entityId: 'list',
                organizationId: sessionData.tenantId,
                userId: sessionData.userId,
                metadata: {
                    query: request.query,
                    resultCount: logs.length,
                    page,
                    limit
                }
            }, request);
            logger.info({
                request_id: request.id,
                user_id: sessionData.userId,
                tenant_id: sessionData.tenantId,
                query: request.query,
                result_count: logs.length
            }, 'Audit logs retrieved');
            return reply.status(200).send({
                logs: logs.map(log => ({
                    id: log.id,
                    action: log.action,
                    entityType: log.entityType,
                    entityId: log.entityId,
                    organizationId: log.organizationId,
                    userId: log.userId,
                    ipAddress: log.ipAddress,
                    userAgent: log.userAgent,
                    sessionId: log.sessionId,
                    oldValues: log.oldValues,
                    newValues: log.newValues,
                    metadata: log.metadata,
                    createdAt: log.createdAt.toISOString()
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            });
        }
        catch (error) {
            logger.error({
                err: error,
                request_id: request.id
            }, 'Audit logs retrieval error');
            return reply.status(500).send({
                error: "Internal Server Error",
                message: "Failed to retrieve audit logs",
                code: "AUDIT_LOGS_ERROR"
            });
        }
    });
    // Get audit log details by ID
    fastify.get("/logs/:id", {
        schema: {
            params: Type.Object({
                id: Type.String()
            }),
            response: {
                200: Type.Object({
                    id: Type.String(),
                    action: Type.String(),
                    entityType: Type.String(),
                    entityId: Type.String(),
                    organizationId: Type.String(),
                    userId: Type.Union([Type.String(), Type.Null()]),
                    ipAddress: Type.Union([Type.String(), Type.Null()]),
                    userAgent: Type.Union([Type.String(), Type.Null()]),
                    sessionId: Type.Union([Type.String(), Type.Null()]),
                    oldValues: Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()]),
                    newValues: Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()]),
                    metadata: Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()]),
                    createdAt: Type.String()
                }),
                404: Type.Object({
                    error: Type.String(),
                    message: Type.String(),
                    code: Type.String()
                })
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            // Extract session to verify user permissions
            const sessionId = extractSessionId(request);
            if (!sessionId) {
                return reply.status(401).send({
                    error: "Unauthorized",
                    message: "No active session",
                    code: "NO_SESSION"
                });
            }
            // Validate session and get user context
            const cache = fastify.cache;
            const sessionDataStr = await cache.get(`session:${sessionId}`);
            if (!sessionDataStr) {
                return reply.status(401).send({
                    error: "Unauthorized",
                    message: "Invalid session",
                    code: "INVALID_SESSION"
                });
            }
            const sessionData = JSON.parse(sessionDataStr);
            // Check if user has admin permissions for audit logs
            if (!sessionData.permissions?.includes('audit.view_logs') &&
                !sessionData.roles?.includes('Platform Admin')) {
                return reply.status(403).send({
                    error: "Forbidden",
                    message: "Insufficient permissions to view audit logs",
                    code: "INSUFFICIENT_PERMISSIONS"
                });
            }
            // Get specific audit log
            const db = fastify.db;
            const log = await db.select()
                .from(auditLogs)
                .where(and(eq(auditLogs.id, id), eq(auditLogs.organizationId, sessionData.tenantId)))
                .limit(1);
            if (log.length === 0) {
                return reply.status(404).send({
                    error: "Not Found",
                    message: "Audit log not found",
                    code: "AUDIT_LOG_NOT_FOUND"
                });
            }
            const auditLog = log[0];
            return reply.status(200).send({
                id: auditLog.id,
                action: auditLog.action,
                entityType: auditLog.entityType,
                entityId: auditLog.entityId,
                organizationId: auditLog.organizationId,
                userId: auditLog.userId,
                ipAddress: auditLog.ipAddress,
                userAgent: auditLog.userAgent,
                sessionId: auditLog.sessionId,
                oldValues: auditLog.oldValues,
                newValues: auditLog.newValues,
                metadata: auditLog.metadata,
                createdAt: auditLog.createdAt.toISOString()
            });
        }
        catch (error) {
            logger.error({
                err: error,
                request_id: request.id,
                log_id: request.params.id
            }, 'Audit log detail retrieval error');
            return reply.status(500).send({
                error: "Internal Server Error",
                message: "Failed to retrieve audit log details",
                code: "AUDIT_LOG_DETAIL_ERROR"
            });
        }
    });
    logger.info('Audit routes registered for tenant administrators');
};
// Helper function to extract session ID from request (reused from auth routes)
function extractSessionId(request) {
    // Try to get session ID from cookie first
    const sessionCookie = request.cookies?.['pf-session'];
    if (sessionCookie) {
        return sessionCookie;
    }
    // Fallback to Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}
//# sourceMappingURL=routes.js.map