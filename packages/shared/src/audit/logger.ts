/**
 * Audit logger interface and implementation
 * Provides structured audit logging functionality
 */

import type { AuditEvent } from '../types/audit.js'

export interface AuditLogger {
  log(event: AuditEvent): Promise<void>
}

/**
 * Default audit logger implementation
 * Uses structured logging via the existing logger
 */
export class DefaultAuditLogger implements AuditLogger {
  constructor(private readonly logger: { info: (obj: Record<string, unknown>) => void }) {}

  async log(event: AuditEvent): Promise<void> {
    this.logger.info({
      type: 'audit',
      actorId: event.actorId,
      organisationId: event.organisationId,
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
      metadata: event.metadata,
      timestamp: event.createdAt?.toISOString() ?? new Date().toISOString()
    })
  }
}

/**
 * No-op audit logger for testing
 */
export class NoOpAuditLogger implements AuditLogger {
  async log(_event: AuditEvent): Promise<void> {
    // No-op implementation
  }
}