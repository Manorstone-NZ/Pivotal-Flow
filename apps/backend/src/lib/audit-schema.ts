// Type definitions for audit logging
export interface AuditValues {
  [key: string]: unknown;
}

export interface AuditMetadata {
  [key: string]: unknown;
}

export interface AuditLog {
  id: string;
  userId: string;
  organizationId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  oldValues?: AuditValues;
  newValues?: AuditValues;
  metadata?: AuditMetadata;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// Helper functions for audit logging
export function createAuditLog(data: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
  return {
    ...data,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
}

export function validateAuditLog(data: unknown): data is AuditLog {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const auditLog = data as Record<string, unknown>;
  
  return (
    typeof auditLog['id'] === 'string' &&
    typeof auditLog['userId'] === 'string' &&
    typeof auditLog['organizationId'] === 'string' &&
    typeof auditLog['action'] === 'string' &&
    typeof auditLog['resourceType'] === 'string' &&
    typeof auditLog['resourceId'] === 'string' &&
    typeof auditLog['timestamp'] === 'string' &&
    (auditLog['oldValues'] === undefined || typeof auditLog['oldValues'] === 'object') &&
    (auditLog['newValues'] === undefined || typeof auditLog['newValues'] === 'object') &&
    (auditLog['metadata'] === undefined || typeof auditLog['metadata'] === 'object') &&
    (auditLog['ipAddress'] === undefined || typeof auditLog['ipAddress'] === 'string') &&
    (auditLog['userAgent'] === undefined || typeof auditLog['userAgent'] === 'string')
  );
}