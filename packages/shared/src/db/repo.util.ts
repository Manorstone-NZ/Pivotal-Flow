// Repository utilities for pagination, sorting, and filter builders

import type { PaginationOptions } from './repo.base.js';

export interface PaginationBuilderOptions {
  page: number;
  pageSize: number;
  maxPageSize?: number;
}

export interface FilterBuilderOptions {
  q?: string;
  isActive?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  roleId?: string;
}

export interface SortBuilderOptions {
  field?: 'createdAt' | 'email';
  direction?: 'asc' | 'desc';
}

export class PaginationBuilder {
  static build(options: PaginationBuilderOptions): {
    skip: number;
    take: number;
    pagination: PaginationOptions;
  } {
    const { page, pageSize, maxPageSize = 100 } = options;
    
    // Validate and normalize pagination
    const normalizedPage = Math.max(1, page);
    const normalizedPageSize = Math.min(Math.max(1, pageSize), maxPageSize);
    
    const skip = (normalizedPage - 1) * normalizedPageSize;
    const take = normalizedPageSize;

    return {
      skip,
      take,
      pagination: {
        page: normalizedPage,
        pageSize: normalizedPageSize
      }
    };
  }

  static validate(options: PaginationOptions): void {
    if (options.page < 1) {
      throw new Error('Page must be at least 1');
    }
    
    if (options.pageSize < 1 || options.pageSize > 100) {
      throw new Error('Page size must be between 1 and 100');
    }
  }
}

export class FilterBuilder {
  static buildUserFilters(options: FilterBuilderOptions): any {
    const filters: any = {
      deletedAt: null
    };

    // Search query filter
    if (options.q) {
      filters.OR = [
        { email: { contains: options.q, mode: 'insensitive' } },
        { displayName: { contains: options.q, mode: 'insensitive' } }
      ];
    }

    // Active status filter
    if (options.isActive !== undefined) {
      filters.status = options.isActive ? 'active' : 'inactive';
    }

    // Date range filters
    if (options.createdFrom || options.createdTo) {
      filters.createdAt = {};
      
      if (options.createdFrom) {
        filters.createdAt.gte = options.createdFrom;
      }
      
      if (options.createdTo) {
        filters.createdAt.lte = options.createdTo;
      }
    }

    // Role filter
    if (options.roleId) {
      filters.userRoles = {
        some: {
          roleId: options.roleId,
          isActive: true,
          role: { isActive: true }
        }
      };
    }

    return filters;
  }

  static buildAuditFilters(options: {
    action?: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    createdFrom?: Date;
    createdTo?: Date;
  }): Prisma.AuditLogWhereInput {
    const filters: Prisma.AuditLogWhereInput = {};

    if (options.action) {
      filters.action = options.action;
    }

    if (options.entityType) {
      filters.entityType = options.entityType;
    }

    if (options.entityId) {
      filters.entityId = options.entityId;
    }

    if (options.userId) {
      filters.userId = options.userId;
    }

    if (options.createdFrom || options.createdTo) {
      filters.createdAt = {};
      
      if (options.createdFrom) {
        filters.createdAt.gte = options.createdFrom;
      }
      
      if (options.createdTo) {
        filters.createdAt.lte = options.createdTo;
      }
    }

    return filters;
  }

  static buildRoleFilters(options: {
    q?: string;
    isActive?: boolean;
    isSystem?: boolean;
    createdFrom?: Date;
    createdTo?: Date;
  }): Prisma.RoleWhereInput {
    const filters: Prisma.RoleWhereInput = {};

    // Search query filter
    if (options.q) {
      filters.OR = [
        { name: { contains: options.q, mode: 'insensitive' } },
        { description: { contains: options.q, mode: 'insensitive' } }
      ];
    }

    // Active status filter
    if (options.isActive !== undefined) {
      filters.isActive = options.isActive;
    }

    // System role filter
    if (options.isSystem !== undefined) {
      filters.isSystem = options.isSystem;
    }

    // Date range filters
    if (options.createdFrom || options.createdTo) {
      filters.createdAt = {};
      
      if (options.createdFrom) {
        filters.createdAt.gte = options.createdFrom;
      }
      
      if (options.createdTo) {
        filters.createdAt.lte = options.createdTo;
      }
    }

    return filters;
  }
}

export class SortBuilder {
  static buildUserSort(options: SortBuilderOptions): Prisma.UserOrderByWithRelationInput {
    const { field = 'createdAt', direction = 'desc' } = options;
    
    // Validate sort options
    const validFields = ['createdAt', 'email'] as const;
    const validDirections = ['asc', 'desc'] as const;
    
    if (!validFields.includes(field)) {
      throw new Error(`Invalid sort field: ${field}. Valid fields: ${validFields.join(', ')}`);
    }
    
    if (!validDirections.includes(direction)) {
      throw new Error(`Invalid sort direction: ${direction}. Valid directions: ${validDirections.join(', ')}`);
    }

    if (field === 'email') {
      return { email: direction };
    }
    
    return { createdAt: direction };
  }

  static buildAuditSort(options: SortBuilderOptions): Prisma.AuditLogOrderByWithRelationInput {
    const { field = 'createdAt', direction = 'desc' } = options;
    
    if (field === 'email') {
      return { user: { email: direction } };
    }
    
    return { createdAt: direction };
  }

  static buildRoleSort(options: SortBuilderOptions): Prisma.RoleOrderByWithRelationInput {
    const { field = 'createdAt', direction = 'desc' } = options;
    
    if (field === 'email') {
      return { name: direction };
    }
    
    return { createdAt: direction };
  }
}

export class QueryBuilder {
  static buildUserQuery(
    filters: Prisma.UserWhereInput,
    sort: Prisma.UserOrderByWithRelationInput,
    pagination: { skip: number; take: number }
  ): Prisma.UserFindManyArgs {
    return {
      where: filters,
      orderBy: sort,
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        email: true,
        displayName: true,
        status: true,
        mfaEnabled: true,
        createdAt: true,
        userRoles: {
          where: { isActive: true },
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                isSystem: true,
                isActive: true
              }
            }
          }
        }
      }
    };
  }

  static buildUserCountQuery(filters: Prisma.UserWhereInput): Prisma.UserCountArgs {
    return {
      where: filters
    };
  }
}
