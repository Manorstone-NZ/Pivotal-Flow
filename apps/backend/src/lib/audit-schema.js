// Helper functions for audit logging
export function createAuditLog(data) {
    return {
        ...data,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
    };
}
export function validateAuditLog(data) {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    const auditLog = data;
    return (typeof auditLog['id'] === 'string' &&
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
        (auditLog['userAgent'] === undefined || typeof auditLog['userAgent'] === 'string'));
}
//# sourceMappingURL=audit-schema.js.map