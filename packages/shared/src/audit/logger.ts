/**
 * Shared audit logging functionality
 * Provides centralized audit logging across the application
 */

import { generateId } from '@pivotal-flow/shared';

export interface AuditLogEvent {
  action: string;
  entityType: string;
  entityId: string;
  organizationId: string;
  actorId: string;
  metadata?: Record<string, unknown>;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

export interface AuditLogResult {
  success: boolean;
  auditId?: string;
  error?: string;
}

/**
 * Shared audit logging function
 * Logs audit events with proper serialization
 */
export async function auditLog(
  db: any,
  event: AuditLogEvent
): Promise<AuditLogResult> {
  try {
    // Sanitize metadata to prevent secrets from being logged
    const sanitizedMetadata = sanitizeMetadata(event.metadata);
    const sanitizedOldValues = sanitizeMetadata(event.oldValues);
    const sanitizedNewValues = sanitizeMetadata(event.newValues);

    const auditId = generateId();
    
    // Note: This is a simplified implementation
    // The actual implementation should use the proper database schema
    // For now, we'll just log to console and return success
    console.log('AUDIT LOG:', {
      id: auditId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      organizationId: event.organizationId,
      actorId: event.actorId,
      metadata: sanitizedMetadata,
      oldValues: sanitizedOldValues,
      newValues: sanitizedNewValues,
      createdAt: new Date(),
    });

    return {
      success: true,
      auditId,
    };
  } catch (error) {
    console.error('Failed to log audit event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sanitize metadata to prevent secrets from being logged
 */
function sanitizeMetadata(data: Record<string, unknown> | undefined): Record<string, unknown> | null {
  if (!data) return null;

  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'credential', 'auth',
    'authorization', 'bearer', 'api_key', 'private_key', 'secret_key'
  ];

  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Create an audit logger instance for a specific context
 */
export function createAuditLogger(
  db: any,
  context: { organizationId: string; actorId: string }
) {
  return {
    log: (event: Omit<AuditLogEvent, 'organizationId' | 'actorId'>) =>
      auditLog(db, { ...event, organizationId: context.organizationId, actorId: context.actorId }),
  };
}
