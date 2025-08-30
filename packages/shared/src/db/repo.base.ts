// Base repository with common helpers for tenant scoping, safe select, explicit DTO shapes, and error mapping

import { PrismaClient, Prisma } from '@prisma/client';

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
    protected readonly prisma: PrismaClient,
    protected readonly options: BaseRepositoryOptions
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
   * Safe select that never includes sensitive fields
   */
  protected safeSelect<T extends Record<string, unknown>>(
    select: Prisma.SelectSubset<T, T>
  ): Prisma.SelectSubset<T, T> {
    // Remove any fields that might contain sensitive data
    const { passwordHash, secret, token, ...safeSelect } = select as any;
    return safeSelect as Prisma.SelectSubset<T, T>;
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
   * Build search filter for text fields
   */
  protected buildSearchFilter(fields: string[], query?: string): any {
    if (!query) return undefined;

    return {
      OR: fields.map(field => ({
        [field]: {
          contains: query,
          mode: 'insensitive'
        }
      }))
    };
  }

  /**
   * Build date range filter
   */
  protected buildDateRangeFilter(
    field: string,
    from?: Date,
    to?: Date
  ): Record<string, unknown> | undefined {
    if (!from && !to) return undefined;

    const filter: Record<string, unknown> = {};
    
    if (from) {
      filter[`${field}_gte`] = from;
    }
    
    if (to) {
      filter[`${field}_lte`] = to;
    }

    return filter;
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
   * Build order by clause for Prisma
   */
  protected buildOrderBy(sort: SortOptions): any {
    if (sort.field === 'email') {
      return { email: sort.direction };
    }
    return { createdAt: sort.direction };
  }

  /**
   * Handle Prisma errors and map to repository errors
   */
  protected handlePrismaError(error: unknown, operation: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new RepositoryError('DUPLICATE_ENTRY', 'Duplicate entry found', error);
        case 'P2025':
          throw new RepositoryError('RECORD_NOT_FOUND', 'Record not found', error);
        case 'P2003':
          throw new RepositoryError('FOREIGN_KEY_CONSTRAINT', 'Foreign key constraint violation', error);
        case 'P2004':
          throw new RepositoryError('DATABASE_CONSTRAINT', 'Database constraint violation', error);
        default:
          throw new RepositoryError('DATABASE_ERROR', `Database error: ${error.code}`, error);
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new RepositoryError('VALIDATION_ERROR', 'Validation error', error);
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new RepositoryError('DATABASE_CONNECTION', 'Database connection error', error);
    }

    throw new RepositoryError('UNKNOWN_ERROR', `Unknown error in ${operation}`, error);
  }
}
