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
 * Base repository class with common functionality
 */
export declare abstract class BaseRepository {
    protected db: PostgresJsDatabase<typeof import('./schema.js')>;
    protected options: BaseRepositoryOptions;
    constructor(db: PostgresJsDatabase<typeof import('./schema.js')>, options: BaseRepositoryOptions);
    /**
     * Enforce organization scoping on all queries
     */
    protected scopeToOrganization<T extends Record<string, unknown>>(query: T): T;
    /**
     * Build pagination result
     */
    protected buildPaginationResult<T>(items: T[], pagination: PaginationOptions, total: number): {
        items: T[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
    /**
     * Create search filter
     */
    protected createSearchFilter(searchTerm: string, fields: string[]): {
        searchTerm: string;
        fields: string[];
    };
    /**
     * Validate sort field
     */
    protected validateSortField(field: string, allowedFields: string[]): boolean;
    /**
     * Handle database errors
     */
    protected handleDatabaseError(error: unknown): never;
}
//# sourceMappingURL=repo.base.d.ts.map