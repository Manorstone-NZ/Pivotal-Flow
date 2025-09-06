/**
 * Audit logger compatibility shim
 * Re-exports from shared audit logger or provides minimal implementation
 */

import type { FastifyInstance } from 'fastify';

// Check if shared audit logger exists
let sharedAuditLogger: unknown = null;
try {
  // Try to import from shared, but don't await at module level
  sharedAuditLogger = require('@pivotal-flow/shared/audit/logger');
} catch {
  // Shared logger doesn't exist yet, we'll create a minimal implementation
}

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

// Export the audit logger class for constructor usage
export class AuditLogger implements IAuditLogger {
  constructor(_fastify: FastifyInstance, _organizationId: string, _userId: string) {
    // Constructor parameters kept for compatibility but not used in this shim
  }

  async logEvent(event: AuditEvent): Promise<void> {
    if (sharedAuditLogger && typeof sharedAuditLogger === 'object' && 'auditLog' in sharedAuditLogger) {
      return (sharedAuditLogger as { auditLog: (event: AuditEvent) => Promise<void> }).auditLog(event);
    }
    
    // Minimal implementation that writes to structured logger
    console.log('AUDIT:', JSON.stringify({
      timestamp: new Date().toISOString(),
      ...event
    }));
  }
}

// Export the audit logger function
export function auditLog(event: AuditEvent): Promise<void> {
      if (sharedAuditLogger && typeof sharedAuditLogger === 'object' && 'auditLog' in sharedAuditLogger) {
      return (sharedAuditLogger as { auditLog: (event: AuditEvent) => Promise<void> }).auditLog(event);
    }
  
  const logger = new AuditLogger({} as any, '', '');
  return logger.logEvent(event);
}
