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
export declare function createAuditLog(data: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog;
export declare function validateAuditLog(data: unknown): data is AuditLog;
//# sourceMappingURL=audit-schema.d.ts.map