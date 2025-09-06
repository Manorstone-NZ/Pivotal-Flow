/**
 * Audit logger compatibility shim
 * Re-exports from shared audit logger or provides minimal implementation
 */
// Check if shared audit logger exists
let sharedAuditLogger = null;
try {
    // Try to import from shared, but don't await at module level
    sharedAuditLogger = require('@pivotal-flow/shared/audit/logger');
}
catch {
    // Shared logger doesn't exist yet, we'll create a minimal implementation
}
// Export the audit logger class for constructor usage
export class AuditLogger {
    constructor(_fastify, _organizationId, _userId) {
        // Constructor parameters kept for compatibility but not used in this shim
    }
    async logEvent(event) {
        if (sharedAuditLogger && typeof sharedAuditLogger === 'object' && 'auditLog' in sharedAuditLogger) {
            return sharedAuditLogger.auditLog(event);
        }
        // Minimal implementation that writes to structured logger
        console.log('AUDIT:', JSON.stringify({
            timestamp: new Date().toISOString(),
            ...event
        }));
    }
}
// Export the audit logger function
export function auditLog(event) {
    if (sharedAuditLogger && typeof sharedAuditLogger === 'object' && 'auditLog' in sharedAuditLogger) {
        return sharedAuditLogger.auditLog(event);
    }
    const logger = new AuditLogger({}, '', '');
    return logger.logEvent(event);
}
//# sourceMappingURL=logger.js.map