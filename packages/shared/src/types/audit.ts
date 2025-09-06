/**
 * Audit event types
 * Defines the structure for audit logging events
 */

export type AuditAction = 
  | "created" 
  | "updated" 
  | "deleted" 
  | "approved" 
  | "rejected" 
  | "payment_applied" 
  | "payment_voided"

export interface AuditEvent {
  actorId: string | null
  organisationId: string
  entityType: string
  entityId: string
  action: AuditAction
  metadata?: Record<string, unknown>
  createdAt?: Date
}