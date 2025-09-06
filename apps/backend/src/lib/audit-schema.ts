import { z } from 'zod';

// JSON schema for audit log old/new values
export const AuditValuesSchema = z.record(z.unknown()).optional();

// JSON schema for audit log metadata
export const AuditMetadataSchema = z.record(z.unknown()).optional();

// Complete audit log schema
export const AuditLogSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  action: z.string(),
  actorId: z.string().optional(),
  requestId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  oldValues: AuditValuesSchema,
  newValues: AuditValuesSchema,
  metadata: AuditMetadataSchema,
  createdAt: z.date()
});

// Type for audit log data
export type AuditLogData = z.infer<typeof AuditLogSchema>;

// Type for audit values
export type AuditValues = z.infer<typeof AuditValuesSchema>;

// Type for audit metadata
export type AuditMetadata = z.infer<typeof AuditMetadataSchema>;

// Validation function for audit log data
export function validateAuditLogData(data: unknown): { isValid: boolean; errors: string[] } {
  try {
    AuditLogSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      isValid: false,
      errors: ['Unknown validation error']
    };
  }
}

// Validation function specifically for old/new values
export function validateAuditValues(values: unknown, context: string): { isValid: boolean; errors: string[] } {
  try {
    AuditValuesSchema.parse(values);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => `${context}.${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      isValid: false,
      errors: [`${context}: Unknown validation error`]
    };
  }
}

// Helper function to create audit log data with validation
export function createAuditLogData(data: {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  oldValues?: AuditValues;
  newValues?: AuditValues;
  metadata?: AuditMetadata;
}): AuditLogData {
  const auditData = {
    ...data,
    createdAt: new Date()
  };

  const validation = validateAuditLogData(auditData);
  if (!validation.isValid) {
    throw new Error(`Invalid audit log data: ${validation.errors.join(', ')}`);
  }

  return auditData;
}
