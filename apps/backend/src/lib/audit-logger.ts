import { PrismaClient } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

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
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
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

      await this.prisma.auditLog.create({ data });
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

export function createAuditLogger(prisma: PrismaClient): AuditLogger {
  return new AuditLogger(prisma);
}
