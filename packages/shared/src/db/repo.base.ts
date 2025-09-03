// Base repository with common helpers for tenant scoping, safe select, explicit DTO shapes, and error mapping

import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, or, gte, lte, desc, asc, ilike } from 'drizzle-orm';

export interface BaseRepositoryOptions {
  organizationId: string;
  userId?: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FilterOptions {
  q?: string;
  isActive?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface SortOptions {
  field: 'createdAt' | 'email';
  direction: 'asc' | 'desc';
}

export class RepositoryError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export abstract class BaseRepository {
  constructor(
    protected readonly db: NodePgDatabase,
    protected readonly options: BaseRepositoryOptions
  ) {}

  /**
   * Generate a unique ID for new records
   */
  protected generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Enforce organization scoping on all queries
   */
  protected scopeToOrganization<T extends Record<string, unknown>>(
    query: T
  ): T {
    if (query && typeof query === 'object' && 'where' in query) {
      const queryWithWhere = query as T & { where: Record<string, unknown> };
      return {
        ...query,
        where: {
          ...queryWithWhere.where,
          organizationId: this.options.organizationId
        }
      } as T;
    }
    return query;
  }

  /**
   * Safe select that never includes sensitive fields
   */
  protected safeSelect<T extends Record<string, unknown>>(
    select: T
  ): T {
    // Remove any fields that might contain sensitive data
    const { passwordHash, secret, token, ...safeSelect } = select as Record<string, unknown>;
    return safeSelect as T;
  }

  /**
   * Build pagination result
   */
  protected buildPaginationResult<T>(
    items: T[],
    total: number,
    options: PaginationOptions
  ): PaginationResult<T> {
    const { page, pageSize } = options;
    const totalPages = Math.ceil(total / pageSize);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages
    };
  }

  /**
   * Build search filter for text fields using Drizzle
   */
  protected buildSearchFilter(fields: string[], query?: string): any {
    if (!query) return undefined;

    return or(
      ...fields.map(field => ilike(field as any, `%${query}%`))
    );
  }

  /**
   * Build date range filter using Drizzle
   */
  protected buildDateRangeFilter(
    field: string,
    from?: Date,
    to?: Date
  ): any {
    if (!from && !to) return undefined;

    const conditions = [];
    
    if (from) {
      conditions.push(gte(field as any, from));
    }
    
    if (to) {
      conditions.push(lte(field as any, to));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  /**
   * Validate and normalize sort options
   */
  protected validateSortOptions(sort?: SortOptions): SortOptions {
    if (!sort) {
      return { field: 'createdAt', direction: 'desc' };
    }

    const validFields = ['createdAt', 'email'] as const;
    const validDirections = ['asc', 'desc'] as const;

    if (!validFields.includes(sort.field)) {
      throw new RepositoryError('INVALID_SORT_FIELD', `Invalid sort field: ${sort.field}`);
    }

    if (!validDirections.includes(sort.direction)) {
      throw new RepositoryError('INVALID_SORT_DIRECTION', `Invalid sort direction: ${sort.direction}`);
    }

    return sort;
  }

  /**
   * Build order by clause for Drizzle
   */
  protected buildOrderBy(sort: SortOptions): any {
    const direction = sort.direction === 'desc' ? desc : asc;
    
    if (sort.field === 'email') {
      return direction('email' as any);
    }
    return direction('createdAt' as any);
  }

  /**
   * Handle database errors and map to repository errors
   */
  protected handleDatabaseError(error: unknown, operation: string): never {
    // Handle PostgreSQL specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as { code: string; message: string };
      
      switch (dbError.code) {
        case '23505': // unique_violation
          throw new RepositoryError('DUPLICATE_ENTRY', 'Duplicate entry found', error);
        case '23503': // foreign_key_violation
          throw new RepositoryError('FOREIGN_KEY_CONSTRAINT', 'Foreign key constraint violation', error);
        case '23514': // check_violation
          throw new RepositoryError('DATABASE_CONSTRAINT', 'Database constraint violation', error);
        case '42P01': // undefined_table
          throw new RepositoryError('TABLE_NOT_FOUND', 'Table not found', error);
        case '42P02': // undefined_column
          throw new RepositoryError('COLUMN_NOT_FOUND', 'Column not found', error);
        default:
          throw new RepositoryError('DATABASE_ERROR', `Database error: ${dbError.code}`, error);
      }
    }

    // Handle connection errors
    if (error && typeof error === 'object' && 'message' in error) {
      const connError = error as { message: string };
      if (connError.message.includes('connection') || connError.message.includes('timeout')) {
        throw new RepositoryError('DATABASE_CONNECTION', 'Database connection error', error);
      }
    }

    throw new RepositoryError('UNKNOWN_ERROR', `Unknown error in ${operation}`, error);
  }
}

