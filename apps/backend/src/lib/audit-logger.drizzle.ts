import type { FastifyRequest, FastifyInstance } from 'fastify';
import { auditLogs } from './schema.js';
import crypto from 'crypto';

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
   * Log an audit event using Drizzle ORM
   */
  async logEvent(event: AuditEvent, request: FastifyRequest): Promise<void> {
    try {
      const data = {
        id: crypto.randomUUID(),
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        organizationId: event.organizationId,
        userId: event.userId ?? null,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] ?? null,
        sessionId: (request as any).user?.jti ?? null,
        oldValues: event.oldValues,
        newValues: event.newValues,
        metadata: event.metadata ?? {},
      };

      await this.fastify.db
        .insert(auditLogs)
        .values(data);
    } catch (error) {
      // Log error but don't fail the request
      // Using console.error as fallback when logger fails
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log authentication events using Drizzle ORM
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
