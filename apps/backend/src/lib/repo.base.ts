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
export abstract class BaseRepository {
  constructor(
    protected db: PostgresJsDatabase<typeof import('./schema.js')>,
    protected options: BaseRepositoryOptions
  ) {}

  /**
   * Enforce organization scoping on all queries
   */
  protected scopeToOrganization<T extends Record<string, unknown>>(
    query: T
  ): T {
    if (query && typeof query === 'object' && 'where' in query) {
      return {
        ...query,
        where: {
          ...(query['where'] as Record<string, unknown>),
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
  protected handleDatabaseError(error: unknown): never {
    // eslint-disable-next-line no-console
    console.error('Database error:', error);

    // Database error code mapping
    const errorMessages: Record<string, string> = {
      '23505': 'A record with this identifier already exists',
      '23503': 'Referenced record does not exist',
      '23514': 'Data validation failed'
    };

    // Check if error has a known code
    if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
      const message = errorMessages[error.code];
      if (message) {
        throw new Error(message);
      }
    }

    // Default error
    throw new Error('Database operation failed');
  }
}
