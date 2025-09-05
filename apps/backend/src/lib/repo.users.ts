/**
 * User DTOs and Repository
 * Drizzle-based user data access with proper DTOs
 */

import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';
import { getDatabase } from '../lib/db.js';
import { users, userRoles, roles } from '../lib/schema.js';

// User DTO - exposes only required fields
export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  organizationId: string;
  roles: string[];
}

// User with roles DTO
export interface UserWithRolesDTO {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  organizationId: string;
  roles: Array<{
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    isActive: boolean;
  }>;
}

// User list filters
export interface UserListFilters {
  q?: string;
  isActive?: boolean;
  roleId?: string;
  userType?: string;
  createdFrom?: Date;
  createdTo?: Date;
}

// User list options
export interface UserListOptions {
  page: number;
  pageSize: number;
  filters?: UserListFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeRoles?: boolean;
}

// User list result
export interface UserListResult {
  users: UserDTO[] | UserWithRolesDTO[];
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
 * User repository with Drizzle
 */
export class UserRepository {
  private db = getDatabase();

  constructor(private organizationId: string) {}

  /**
   * List users with pagination and filtering
   */
  async listUsers(options: UserListOptions): Promise<UserListResult> {
    const { page, pageSize, filters = {}, sortBy = 'createdAt', sortOrder = 'desc', includeRoles = false } = options;
    
    // Build conditions
    const conditions = [
      eq(users.organizationId, this.organizationId),
      isNull(users.deletedAt)
    ];

    if (filters.isActive !== undefined) {
      conditions.push(eq(users.status, filters.isActive ? 'active' : 'inactive'));
    }

    if (filters.userType) {
      conditions.push(eq(users.userType, filters.userType));
    }

    if (filters.createdFrom) {
      conditions.push(sql`${users.createdAt} >= ${filters.createdFrom}`);
    }

    if (filters.createdTo) {
      conditions.push(sql`${users.createdAt} <= ${filters.createdTo}`);
    }

    // Search filter
    if (filters.q) {
      conditions.push(
        sql`(${users.displayName} ILIKE ${`%${filters.q}%`} OR ${users.email} ILIKE ${`%${filters.q}%`})`
      );
    }

    // Build sort
    const sortColumn = this.getSortColumn(sortBy);
    const sortDirection = sortOrder === 'asc' ? asc : desc;

    if (includeRoles) {
      // Query with roles
      const [userData, totalResult] = await Promise.all([
        this.db
          .select({
            id: users.id,
            email: users.email,
            displayName: users.displayName,
            isActive: sql`${users.status} = 'active'`,
            organizationId: users.organizationId,
            roleId: userRoles.roleId,
            roleName: roles.name,
            roleDescription: roles.description,
            roleIsSystem: roles.isSystem,
            roleIsActive: roles.isActive,
          })
          .from(users)
          .leftJoin(userRoles, eq(users.id, userRoles.userId))
          .leftJoin(roles, eq(userRoles.roleId, roles.id))
          .where(and(...conditions))
          .orderBy(sortDirection(sortColumn))
          .limit(pageSize)
          .offset((page - 1) * pageSize),
        
        this.db
          .select({ count: sql<number>`count(distinct ${users.id})` })
          .from(users)
          .where(and(...conditions))
      ]);

      // Group by user and build roles
      const userMap = new Map<string, UserWithRolesDTO>();
      
      userData.forEach(row => {
        if (!userMap.has(row.id)) {
          userMap.set(row.id, {
            id: row.id,
            email: row.email,
            displayName: row.displayName || `${row.email}`,
            isActive: row.isActive,
            organizationId: row.organizationId,
            roles: []
          });
        }

        if (row.roleId) {
          const user = userMap.get(row.id)!;
          user.roles.push({
            id: row.roleId,
            name: row.roleName,
            description: row.roleDescription,
            isSystem: row.roleIsSystem,
            isActive: row.roleIsActive
          });
        }
      });

      const usersWithRoles = Array.from(userMap.values());
      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        users: usersWithRoles,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page * pageSize < total,
          hasPrev: page > 1
        }
      };
    } else {
      // Simple query without roles
      const [userData, totalResult] = await Promise.all([
        this.db
          .select({
            id: users.id,
            email: users.email,
            displayName: users.displayName,
            isActive: sql`${users.status} = 'active'`,
            organizationId: users.organizationId,
          })
          .from(users)
          .where(and(...conditions))
          .orderBy(sortDirection(sortColumn))
          .limit(pageSize)
          .offset((page - 1) * pageSize),
        
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(and(...conditions))
      ]);

      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        users: userData.map(user => ({
          ...user,
          displayName: user.displayName || user.email,
          roles: [] // Empty array for simple DTO
        })),
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
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string, includeRoles = false): Promise<UserDTO | UserWithRolesDTO | null> {
    if (includeRoles) {
      const result = await this.db
        .select({
          id: users.id,
          email: users.email,
          displayName: users.displayName,
          isActive: sql`${users.status} = 'active'`,
          organizationId: users.organizationId,
          roleId: userRoles.roleId,
          roleName: roles.name,
          roleDescription: roles.description,
          roleIsSystem: roles.isSystem,
          roleIsActive: roles.isActive,
        })
        .from(users)
        .leftJoin(userRoles, eq(users.id, userRoles.userId))
        .leftJoin(roles, eq(userRoles.roleId, roles.id))
        .where(and(
          eq(users.id, id),
          eq(users.organizationId, this.organizationId),
          isNull(users.deletedAt)
        ));

      if (result.length === 0) return null;

      const userRoles = result
        .filter(row => row.roleId)
        .map(row => ({
          id: row.roleId!,
          name: row.roleName!,
          description: row.roleDescription,
          isSystem: row.roleIsSystem!,
          isActive: row.roleIsActive!
        }));

      return {
        id: result[0].id,
        email: result[0].email,
        displayName: result[0].displayName || result[0].email,
        isActive: result[0].isActive,
        organizationId: result[0].organizationId,
        roles: userRoles
      };
    } else {
      const result = await this.db
        .select({
          id: users.id,
          email: users.email,
          displayName: users.displayName,
          isActive: sql`${users.status} = 'active'`,
          organizationId: users.organizationId,
        })
        .from(users)
        .where(and(
          eq(users.id, id),
          eq(users.organizationId, this.organizationId),
          isNull(users.deletedAt)
        ))
        .limit(1);

      if (result.length === 0) return null;

      return {
        ...result[0],
        displayName: result[0].displayName || result[0].email,
        roles: []
      };
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserDTO | null> {
    const result = await this.db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        isActive: sql`${users.status} = 'active'`,
        organizationId: users.organizationId,
      })
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.organizationId, this.organizationId),
        isNull(users.deletedAt)
      ))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      displayName: result[0].displayName || result[0].email,
      roles: []
    };
  }

  /**
   * Get sort column
   */
  private getSortColumn(sortBy: string) {
    switch (sortBy) {
      case 'displayName':
        return users.displayName;
      case 'email':
        return users.email;
      case 'createdAt':
        return users.createdAt;
      case 'updatedAt':
        return users.updatedAt;
      default:
        return users.createdAt;
    }
  }
}
