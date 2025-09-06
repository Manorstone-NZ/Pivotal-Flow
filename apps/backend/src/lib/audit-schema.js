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
// Validation function for audit log data
export function validateAuditLogData(data) {
    try {
        AuditLogSchema.parse(data);
        return { isValid: true, errors: [] };
    }
    catch (error) {
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
export function validateAuditValues(values, context) {
    try {
        AuditValuesSchema.parse(values);
        return { isValid: true, errors: [] };
    }
    catch (error) {
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
export function createAuditLogData(data) {
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
//# sourceMappingURL=audit-schema.js.map