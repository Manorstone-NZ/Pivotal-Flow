import { z } from 'zod';
export declare const AuditValuesSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
export declare const AuditMetadataSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
export declare const AuditLogSchema: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    entityType: z.ZodString;
    entityId: z.ZodString;
    action: z.ZodString;
    actorId: z.ZodOptional<z.ZodString>;
    requestId: z.ZodOptional<z.ZodString>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    oldValues: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    newValues: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    organizationId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown> | undefined;
    oldValues?: Record<string, unknown> | undefined;
    newValues?: Record<string, unknown> | undefined;
    userAgent?: string | undefined;
    sessionId?: string | undefined;
    requestId?: string | undefined;
    ipAddress?: string | undefined;
    actorId?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    organizationId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown> | undefined;
    oldValues?: Record<string, unknown> | undefined;
    newValues?: Record<string, unknown> | undefined;
    userAgent?: string | undefined;
    sessionId?: string | undefined;
    requestId?: string | undefined;
    ipAddress?: string | undefined;
    actorId?: string | undefined;
}>;
export type AuditLogData = z.infer<typeof AuditLogSchema>;
export type AuditValues = z.infer<typeof AuditValuesSchema>;
export type AuditMetadata = z.infer<typeof AuditMetadataSchema>;
export declare function validateAuditLogData(data: unknown): {
    isValid: boolean;
    errors: string[];
};
export declare function validateAuditValues(values: unknown, context: string): {
    isValid: boolean;
    errors: string[];
};
export declare function createAuditLogData(data: {
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
}): AuditLogData;
//# sourceMappingURL=audit-schema.d.ts.map