import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Sql } from 'postgres';
import * as schema from './schema.js';
export declare function initializeDatabase(): Promise<void>;
export declare function getDatabase(): PostgresJsDatabase<typeof schema>;
export declare function getClient(): Sql;
export declare const hybridDb: {
    readonly select: unknown;
    readonly insert: unknown;
    readonly update: unknown;
    readonly delete: unknown;
    readonly execute: unknown;
    readonly transaction: unknown;
    query(sql: string, params?: unknown[]): Promise<unknown>;
    disconnect(): Promise<void>;
};
export declare function healthCheck(): Promise<{
    status: 'ok' | 'error';
    message: string;
    latency: number;
}>;
export declare function isDatabaseReady(): boolean;
//# sourceMappingURL=db.d.ts.map