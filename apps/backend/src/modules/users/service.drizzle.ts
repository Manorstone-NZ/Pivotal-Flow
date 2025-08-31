// User service layer - Drizzle ORM calls only, no HTTP logic

import type { FastifyInstance } from 'fastify';
import { eq, and, like, desc, asc, isNull, count } from 'drizzle-orm';
import { users, roles, userRoles } from '../../lib/schema.js';
import type { UserPublic, UserListSort } from '@pivotal-flow/shared/types/user';
import type { UserListFilters } from '../../types/database.js';

export interface UserListOptions {
  organizationId: string;
  filters?: Partial<UserListFilters>;
  sort?: UserListSort;
  page: number;
  pageSize: number;
}

export interface UserListResult {
  items: UserPublic[];
  total: number;
  totalPages: number;
}

export interface UserWithRoles {
  id: string;
  email: string;
  displayName: string | null;
  status: string;
  mfaEnabled: boolean;
  createdAt: Date;
  organizationId: string;
  roles: Array<{
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    isActive: boolean;
  }>;
}

/**
 * List users with pagination and filters using Drizzle ORM
 */
export async function listUsers(options: UserListOptions, fastify: FastifyInstance): Promise<UserListResult> {
  const { organizationId, filters = {}, sort = { field: 'createdAt', direction: 'desc' }, page, pageSize } = options;

  // Build where conditions
  const whereConditions = [
    eq(users.organizationId, organizationId),
    isNull(users.deletedAt)
  ];

  if (filters.isActive !== undefined) {
    whereConditions.push(eq(users.status, filters.isActive ? 'active' : 'inactive'));
  }

  if (filters.q) {
    whereConditions.push(like(users.email, `%${filters.q}%`));
  }

  // Get total count
  const countResult = await fastify.db
    .select({ total: count() })
    .from(users)
    .where(and(...whereConditions));

  const total = countResult[0]?.total || 0;

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  // Get users with roles using Drizzle
  const usersResult = await fastify.db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      status: users.status,
      mfaEnabled: users.mfaEnabled,
      createdAt: users.createdAt,
      organizationId: users.organizationId,
      roleId: roles.id,
      roleName: roles.name,
      roleDescription: roles.description,
      roleIsSystem: roles.isSystem,
      roleIsActive: roles.isActive,
    })
    .from(users)
    .leftJoin(userRoles, and(
      eq(userRoles.userId, users.id),
      eq(userRoles.isActive, true)
    ))
    .leftJoin(roles, and(
      eq(userRoles.roleId, roles.id),
      eq(roles.isActive, true)
    ))
    .where(and(...whereConditions))
    .orderBy(sort.field === 'email' ? asc(users.email) : desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Transform to UserWithRoles format
  const userMap = new Map<string, UserWithRoles>();
  
  for (const row of usersResult) {
    const userId = row.id;
    
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        id: userId,
        email: row.email,
        displayName: row.displayName,
        status: row.status,
        mfaEnabled: row.mfaEnabled,
        createdAt: row.createdAt,
        organizationId: row.organizationId,
        roles: []
      });
    }

    if (row.roleId && row.roleName && row.roleIsSystem !== null && row.roleIsActive !== null) {
      userMap.get(userId)!.roles.push({
        id: row.roleId,
        name: row.roleName,
        description: row.roleDescription,
        isSystem: row.roleIsSystem,
        isActive: row.roleIsActive
      });
    }
  }

  // Transform to UserPublic format
  const items: UserPublic[] = Array.from(userMap.values()).map(user => ({
    id: user.id,
    email: user.email,
    displayName: user.displayName || 'Unknown User',
    isActive: user.status === 'active',
    mfaEnabled: user.mfaEnabled,
    createdAt: user.createdAt,
    roles: user.roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      isActive: role.isActive
    }))
  }));

  return {
    items,
    total,
    totalPages
  };
}

/**
 * Get user by ID using Drizzle ORM
 */
export async function getUserById(userId: string, organizationId: string, fastify: FastifyInstance): Promise<UserWithRoles | null> {
  const result = await fastify.db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      status: users.status,
      mfaEnabled: users.mfaEnabled,
      createdAt: users.createdAt,
      organizationId: users.organizationId,
      roleId: roles.id,
      roleName: roles.name,
      roleDescription: roles.description,
      roleIsSystem: roles.isSystem,
      roleIsActive: roles.isActive,
    })
    .from(users)
    .leftJoin(userRoles, and(
      eq(userRoles.userId, users.id),
      eq(userRoles.isActive, true)
    ))
    .leftJoin(roles, and(
      eq(userRoles.roleId, roles.id),
      eq(roles.isActive, true)
    ))
    .where(and(
      eq(users.id, userId),
      eq(users.organizationId, organizationId),
      isNull(users.deletedAt)
    ));

  if (result.length === 0) {
    return null;
  }

  const firstRow = result[0];
  if (!firstRow) {
    return null;
  }

  const user: UserWithRoles = {
    id: firstRow.id,
    email: firstRow.email,
    displayName: firstRow.displayName,
    status: firstRow.status,
    mfaEnabled: firstRow.mfaEnabled,
    createdAt: firstRow.createdAt,
    organizationId: firstRow.organizationId,
    roles: []
  };

  // Add roles
  for (const row of result) {
    if (row.roleId && row.roleName && row.roleIsSystem !== null && row.roleIsActive !== null) {
      user.roles.push({
        id: row.roleId,
        name: row.roleName,
        description: row.roleDescription,
        isSystem: row.roleIsSystem,
        isActive: row.roleIsActive
      });
    }
  }

  return user;
}
