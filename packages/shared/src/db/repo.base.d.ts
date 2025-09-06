/**
 * Shared Repository Base
 * Common repository functionality for Drizzle ORM
 */
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
/**
 * Base repository options
 */
export interface BaseRepositoryOptions {
    organizationId: string;
    userId?: string;
}
/**
 * Pagination options
 */
export interface PaginationOptions {
    page: number;
    pageSize: number;
    search?: string;
}
/**
 * Pagination result
 */
export interface PaginationResult<T> {
    items: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
/**
 * Base repository class with common functionality
 */
export declare abstract class BaseRepository {
    protected db: PostgresJsDatabase<any>;
    protected options: BaseRepositoryOptions;
    constructor(db: PostgresJsDatabase<any>, options: BaseRepositoryOptions);
    /**
     * Build pagination result
     */
    protected buildPaginationResult<T>(items: T[], pagination: PaginationOptions, total: number): PaginationResult<T>;
    /**
     * Handle database errors
     */
    protected handleDatabaseError(error: unknown): never;
}
//# sourceMappingURL=repo.base.d.ts.map