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

export class AuditLogger {
  private fastify: FastifyInstance;
  private options: AuditLoggerOptions;

  constructor(fastify: FastifyInstance, options: AuditLoggerOptions) {
    this.fastify = fastify;
    this.options = options;
  }

  async logEvent(event: AuditEvent): Promise<void> {
    try {
      const auditRecord = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        organizationId: event.organizationId,
        userId: event.userId || this.options.userId,
        oldValues: event.oldValues ? JSON.stringify(event.oldValues) : null,
        newValues: event.newValues ? JSON.stringify(event.newValues) : null,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        timestamp: event.timestamp || new Date(),
        createdAt: new Date()
      };

      // For now, log to console - in production this would go to database
      this.fastify.log.info({
        message: 'Audit event',
        ...auditRecord
      });

      // TODO: Implement database storage
      // await this.fastify.db.insert(auditLogs).values(auditRecord);
    } catch (error) {
      this.fastify.log.error('Audit logging failed:', error as Error);
    }
  }

  async logUserAction(action: string, details: Record<string, any> = {}): Promise<void> {
    await this.logEvent({
      action,
      entityType: 'user',
      entityId: this.options.userId,
      organizationId: this.options.organizationId,
      userId: this.options.userId,
      metadata: details
    });
  }

  async logDataAccess(entityType: string, entityId: string, operation: 'read' | 'write' | 'delete'): Promise<void> {
    await this.logEvent({
      action: `data.${operation}`,
      entityType,
      entityId,
      organizationId: this.options.organizationId,
      userId: this.options.userId,
      metadata: { operation }
    });
  }
}
