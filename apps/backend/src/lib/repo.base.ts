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
}

/**
 * Base repository class with common functionality
 */
export abstract class BaseRepository {
  constructor(
    protected db: PostgresJsDatabase<typeof import('./schema.js')>,
    protected options: BaseRepositoryOptions
  ) {}

  /**
   * Enforce organization scoping on all queries
   */
  protected scopeToOrganization<T extends Record<string, any>>(
    query: T
  ): T {
    if (query && typeof query === 'object' && 'where' in query) {
      return {
        ...query,
        where: {
          ...(query['where'] as any),
          organizationId: this.options.organizationId
        }
      } as T;
    }
    return query;
  }

  /**
   * Build pagination result
   */
  protected buildPaginationResult<T>(
    items: T[],
    pagination: PaginationOptions,
    total: number
  ) {
    const { page, pageSize } = pagination;
    const totalPages = Math.ceil(total / pageSize);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page * pageSize < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Create search filter
   */
  protected createSearchFilter(searchTerm: string, fields: string[]) {
    // This would be implemented based on the specific ORM being used
    // For now, return a simple object that can be extended
    return {
      searchTerm,
      fields
    };
  }

  /**
   * Validate sort field
   */
  protected validateSortField(field: string, allowedFields: string[]): boolean {
    return allowedFields.includes(field);
  }

  /**
   * Handle database errors
   */
  protected handleDatabaseError(error: any): never {
    // Log the error
    console.error('Database error:', error);

    // Map common database errors to user-friendly messages
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('A record with this identifier already exists');
    }

    if (error.code === '23503') { // Foreign key constraint violation
      throw new Error('Referenced record does not exist');
    }

    if (error.code === '23514') { // Check constraint violation
      throw new Error('Data validation failed');
    }

    // Default error
    throw new Error('Database operation failed');
  }
}
