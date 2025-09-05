/**
 * Audit types shared across the application
 */

export enum AuditEventType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  CONFIGURE = 'configure',
  VIEW = 'view'
}

export interface AuditEvent {
  id: string;
  organizationId: string;
  userId: string;
  eventType: AuditEventType;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId: string;
  organizationId: string;
  userId: string;
  oldValues?: any;
  newValues?: any;
  metadata?: Record<string, any>;
}

export interface AuditContext {
  organizationId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditEntityType = 
  | 'User'
  | 'Customer'
  | 'Project'
  | 'Quote'
  | 'Invoice'
  | 'Payment'
  | 'TimeEntry'
  | 'ResourceAllocation'
  | 'Approval'
  | 'Organization'
  | 'Role'
  | 'Permission';
