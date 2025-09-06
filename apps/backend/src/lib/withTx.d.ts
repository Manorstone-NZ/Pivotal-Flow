import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
/**
 * Transaction helper with retry logic and timeout
 * Provides a safe way to execute database operations within transactions
 */
export declare function withTx<T>(db: PostgresJsDatabase<typeof import('./schema.js')>, operation: (tx: PostgresJsDatabase<typeof import('./schema.js')>) => Promise<T>, options?: {
    maxRetries?: number;
    timeout?: number;
}): Promise<T>;
//# sourceMappingURL=withTx.d.ts.map