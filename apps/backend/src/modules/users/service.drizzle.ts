// User service layer - Drizzle ORM calls only, no HTTP logic

import type { FastifyInstance } from 'fastify';
import { eq, and, like, desc, asc, isNull, count } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { users, roles, userRoles } from '../../lib/schema.js';
// Local type definitions to avoid shared module dependencies
export interface UserPublic {
  id: string;
  email: string;
  displayName: string | null;
  status: string;
  isActive: boolean;
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

export interface UserListSort {
  field: 'email' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface UserCreateRequest {
  email: string;
  displayName?: string;
  password: string;
}

export interface UserUpdateRequest {
  displayName?: string;
  status?: string;
  mfaEnabled?: boolean;
}

export interface UserListFilters {
  isActive?: boolean;
  q?: string;
}

// Local password hashing function
async function hashPassword(password: string): Promise<string> {
  // Simple hash for now - replace with proper bcrypt in production
  return Buffer.from(password).toString('base64');
}

export interface UserListOptions {
  organizationId: string;
  filters?: Partial<UserListFilters>;
  sort: UserListSort;
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
  const countResult = await (fastify as any).db
    .select({ total: count() })
    .from(users)
    .where(and(...whereConditions));

  const total = countResult[0]?.total || 0;

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  // Get users with roles using Drizzle
  const usersResult = await (fastify as any).db
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
            displayName: user.displayName ?? 'Unknown User',
    status: user.status,
    isActive: user.status === 'active',
    mfaEnabled: user.mfaEnabled,
    createdAt: user.createdAt,
    organizationId: user.organizationId,
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
  const result = await (fastify as any).db
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

/**
 * Create new user using Drizzle ORM
 */
export async function createUser(userData: UserCreateRequest, organizationId: string, fastify: FastifyInstance): Promise<UserWithRoles> {
  const { email, displayName } = userData;
  // Note: Password and role assignment will be implemented in future iterations
  const password = 'temporary-password';
  const roleIds: string[] = [];

  // Check if user already exists
  const existingUser = await (fastify as any).db
    .select({ id: users.id })
    .from(users)
    .where(and(
      eq(users.email, email),
      eq(users.organizationId, organizationId),
      isNull(users.deletedAt)
    ))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error('User with this email already exists');
  }

  // Create user
  const hashedPassword = await hashPassword(password);
  const [userResult] = await (fastify as any).db
    .insert(users)
    .values({
      id: generateId(),
      email,
      displayName,
      passwordHash: hashedPassword,
      status: 'active',
      mfaEnabled: false,
      organizationId,
    })
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      status: users.status,
      mfaEnabled: users.mfaEnabled,
      createdAt: users.createdAt,
      organizationId: users.organizationId,
    });

  if (!userResult) {
    throw new Error('Failed to create user');
  }

  const userId = userResult.id;

  // Assign roles
  if (roleIds.length > 0) {
    for (const roleId of roleIds) {
      await (fastify as any).db
        .insert(userRoles)
        .values({
          id: generateId(),
          userId,
          roleId,
          organizationId,
          isActive: true,
        });
    }
  }

  // Return created user with roles
  const createdUser = await getUserById(userId, organizationId, fastify);
  if (!createdUser) {
    throw new Error('Failed to create user');
  }

  return createdUser;
}

/**
 * Update user using Drizzle ORM
 */
export async function updateUser(
  userId: string, 
  updateData: UserUpdateRequest, 
  organizationId: string, 
  fastify: FastifyInstance
): Promise<UserWithRoles> {
  const { displayName } = updateData;
  // Note: Status and MFA settings will be implemented in future iterations
  const status = 'active';
  const mfaEnabled = false;

  const [result] = await (fastify as any).db
    .update(users)
    .set({
      displayName,
      status,
      mfaEnabled,
    })
    .where(and(
      eq(users.id, userId),
      eq(users.organizationId, organizationId),
      isNull(users.deletedAt)
    ))
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      status: users.status,
      mfaEnabled: users.mfaEnabled,
      createdAt: users.createdAt,
      organizationId: users.organizationId,
    });

  if (!result) {
    throw new Error('User not found');
  }

  // Return updated user with roles
  const updatedUser = await getUserById(userId, organizationId, fastify);
  if (!updatedUser) {
    throw new Error('Failed to update user');
  }

  return updatedUser;
}

/**
 * Add role to user using Drizzle ORM
 */
export async function addRoleToUser(
  userId: string, 
  roleId: string, 
  organizationId: string, 
  fastify: FastifyInstance
): Promise<void> {
  // Check if user exists
  const userExists = await (fastify as any).db
    .select({ id: users.id })
    .from(users)
    .where(and(
      eq(users.id, userId),
      eq(users.organizationId, organizationId),
      isNull(users.deletedAt)
    ))
    .limit(1);

  if (userExists.length === 0) {
    throw new Error('User not found');
  }

  // Check if role exists
  const roleExists = await (fastify as any).db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.isActive, true))
    .limit(1);

  if (roleExists.length === 0) {
    throw new Error('Role not found');
  }

  // Check if user already has this role
  const existingRole = await (fastify as any).db
    .select({ id: userRoles.id })
    .from(userRoles)
    .where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.roleId, roleId)
    ))
    .limit(1);

  if (existingRole.length > 0) {
    // Update existing role to active
    await (fastify as any).db
      .update(userRoles)
      .set({
        isActive: true,
      })
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleId, roleId)
      ));
  } else {
    // Create new user role
    await (fastify as any).db
      .insert(userRoles)
      .values({
        id: generateId(),
        userId,
        roleId,
        organizationId,
        isActive: true,
      });
  }
}

/**
 * Remove role from user using Drizzle ORM
 */
export async function removeRoleFromUser(
  userId: string, 
  roleId: string, 
  organizationId: string, 
  fastify: FastifyInstance
): Promise<void> {
  // Check if user exists
  const userExists = await (fastify as any).db
    .select({ id: users.id })
    .from(users)
    .where(and(
      eq(users.id, userId),
      eq(users.organizationId, organizationId),
      isNull(users.deletedAt)
    ))
    .limit(1);

  if (userExists.length === 0) {
    throw new Error('User not found');
  }

  // Deactivate user role
  await (fastify as any).db
    .update(userRoles)
    .set({
      isActive: false,
    })
    .where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.roleId, roleId)
    ));
}

/**
 * Get user roles using Drizzle ORM
 */
export async function getUserRoles(userId: string, fastify: FastifyInstance): Promise<Array<{
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
}>> {
  const result = await (fastify as any).db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      isSystem: roles.isSystem,
      isActive: roles.isActive,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.isActive, true),
      eq(roles.isActive, true)
    ));

  return result.map((row: {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    isActive: boolean;
  }) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    isSystem: row.isSystem,
    isActive: row.isActive
  }));
}

/**
 * Check if user has role using Drizzle ORM
 */
export async function userHasRole(userId: string, roleName: string, fastify: FastifyInstance): Promise<boolean> {
  const result = await (fastify as any).db
    .select({ id: roles.id })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.isActive, true),
      eq(roles.name, roleName),
      eq(roles.isActive, true)
    ))
    .limit(1);

  return result.length > 0;
}
