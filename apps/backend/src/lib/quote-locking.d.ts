import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
export interface QuoteLockContext {
    quoteId: string;
    organizationId: string;
    userId: string;
    newData: unknown;
}
export interface QuoteLockResult {
    isLocked: boolean;
    canForceEdit: boolean;
    requiresVersioning: boolean;
    reason?: string;
}
export declare class QuoteLockingService {
    private db;
    constructor(db: PostgresJsDatabase<typeof import('./schema.js')>);
    /**
     * Check if a quote is locked and determine edit permissions
     */
    checkQuoteLock(context: QuoteLockContext): Promise<QuoteLockResult>;
    /**
     * Check if user has force_edit permission for quotes
     */
    private hasForceEditPermission;
    /**
     * Validate that the user can edit the quote based on its status
     */
    validateEditPermission(quoteId: string, organizationId: string, userId: string): Promise<void>;
    /**
     * Determine if a quote edit requires versioning
     */
    requiresVersioning(quoteId: string, organizationId: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=quote-locking.d.ts.map