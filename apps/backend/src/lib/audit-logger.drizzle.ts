import type { FastifyRequest, FastifyInstance } from 'fastify';
import { auditLogs } from './schema.js';
import { generateId } from '@pivotal-flow/shared';

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

export class AuditLogger {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Log an audit event using Drizzle ORM
   */
  async logEvent(event: AuditEvent, request?: FastifyRequest): Promise<void> {
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
        sessionId: (request as { user?: { jti?: string } })?.user?.jti ?? null,
        oldValues: event.oldValues,
        newValues: event.newValues,
        metadata: event.metadata ?? {},
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.fastify as any).db
        .insert(auditLogs)
        .values(data);
    } catch (error) {
      // eslint-disable-next-line no-console
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
    metadata: Record<string, unknown> | null,
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
