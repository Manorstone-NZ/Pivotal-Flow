/**
 * Audit logger interface and implementation
 * Provides structured audit logging functionality
 */
import type { AuditEvent } from '../types/audit.js';
export interface AuditLogger {
    log(event: AuditEvent): Promise<void>;
}
/**
 * Default audit logger implementation
 * Uses structured logging via the existing logger
 */
export declare class DefaultAuditLogger implements AuditLogger {
    private readonly logger;
    constructor(logger: {
        info: (obj: Record<string, unknown>) => void;
    });
    log(event: AuditEvent): Promise<void>;
}
/**
 * No-op audit logger for testing
 */
export declare class NoOpAuditLogger implements AuditLogger {
    log(_event: AuditEvent): Promise<void>;
}
//# sourceMappingURL=logger.d.ts.map