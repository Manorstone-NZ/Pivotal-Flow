import type { FastifyRequest, FastifyInstance } from 'fastify';

export interface AuditEvent {
  action: string;
  entityType: string;
  entityId: string;
  organizationId: string;
  userId?: string | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
}

export class AuditLogger {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Log an audit event
   */
  async logEvent(event: AuditEvent, request: FastifyRequest): Promise<void> {
    try {
      const data: any = {
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        organizationId: event.organizationId,
        userId: event.userId ?? null,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] ?? null,
        sessionId: (request as any).user?.jti ?? null,
        metadata: event.metadata ?? {},
      };

      if (event.oldValues != null) {
        data.oldValues = event.oldValues;
      }

      if (event.newValues != null) {
        data.newValues = event.newValues;
      }

      await this.fastify.db.query(`
        INSERT INTO audit_logs (
          action, entity_type, entity_id, organization_id, user_id, 
          ip_address, user_agent, session_id, old_values, new_values, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        data.action, data.entityType, data.entityId, data.organizationId, data.userId,
        data.ipAddress, data.userAgent, data.sessionId, data.oldValues, data.newValues, data.metadata
      ]);
    } catch (error) {
      // Log error but don't fail the request
      // Using console.error as fallback when logger fails
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    action: 'auth.login' | 'auth.login_failed' | 'auth.logout' | 'auth.refresh',
    organizationId: string,
    userId: string | null,
    metadata: Record<string, any> | null,
    request: FastifyRequest
  ): Promise<void> {
    await this.logEvent(
      {
        action,
        entityType: 'user',
        entityId: userId ?? 'unknown',
        organizationId,
        userId,
        metadata: metadata ?? {},
      },
      request
    );
  }
}

export function createAuditLogger(fastify: FastifyInstance): AuditLogger {
  return new AuditLogger(fastify);
}
