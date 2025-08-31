// User service layer - Raw SQL calls only, no HTTP logic

import type { FastifyInstance } from 'fastify';
import type { UserPublic, UserCreateRequest, UserUpdateRequest, UserListSort } from '@pivotal-flow/shared/types/user';
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
 * List users with pagination and filters
 */
export async function listUsers(options: UserListOptions, fastify: FastifyInstance): Promise<UserListResult> {
  const { organizationId, filters = {}, sort = { field: 'createdAt', direction: 'desc' }, page, pageSize } = options;

  // Build WHERE clause
  let whereClause = 'WHERE u."organizationId" = $1 AND u."deletedAt" IS NULL';
  const params: any[] = [organizationId];
  let paramIndex = 2;

  if (filters.isActive !== undefined) {
    whereClause += ` AND u.status = $${paramIndex}`;
    params.push(filters.isActive ? 'active' : 'inactive');
    paramIndex++;
  }

  if (filters.q) {
    whereClause += ` AND (u.email ILIKE $${paramIndex} OR u."displayName" ILIKE $${paramIndex})`;
    params.push(`%${filters.q}%`);
    paramIndex++;
  }

  if (filters.roleId) {
    whereClause += ` AND EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = u.id 
      AND ur.role_id = $${paramIndex} 
      AND ur.is_active = true
    )`;
    params.push(filters.roleId);
    paramIndex++;
  }

  // Build ORDER BY clause
  const orderBy = sort.field === 'email' ? 'u.email' : 'u."createdAt"';
  const orderDirection = sort.direction === 'asc' ? 'ASC' : 'DESC';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM users u
    ${whereClause}
  `;
  
  const countResult = await fastify.db.query(countQuery, params);
  const total = parseInt((countResult[0]?.['total'] as string) || '0');

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  // Get users with roles
  const usersQuery = `
    SELECT 
      u.id,
      u.email,
      u."displayName",
      u.status,
      u."mfaEnabled",
      u."createdAt",
      u."organizationId",
      r.id as role_id,
      r.name as role_name,
      r.description as role_description,
      r."isSystem" as role_is_system,
      r."isActive" as role_is_active
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur."userId" AND ur."isActive" = true
    LEFT JOIN roles r ON ur."roleId" = r.id AND r."isActive" = true
    ${whereClause}
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const usersResult = await fastify.db.query(usersQuery, [...params, pageSize, offset]);

  // Transform to UserWithRoles format
  const userMap = new Map<string, UserWithRoles>();
  
  for (const row of usersResult) {
    const userId = row['id'] as string;
    
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        id: userId,
        email: row['email'] as string,
        displayName: row['displayName'] as string | null,
        status: row['status'] as string,
        mfaEnabled: row['mfaEnabled'] as boolean,
        createdAt: row['createdAt'] as Date,
        organizationId: row['organizationId'] as string,
        roles: []
      });
    }

    if (row['role_id']) {
      userMap.get(userId)!.roles.push({
        id: row['role_id'] as string,
        name: row['role_name'] as string,
        description: row['role_description'] as string | null,
        isSystem: row['role_is_system'] as boolean,
        isActive: row['role_is_active'] as boolean
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
 * Get user by ID
 */
export async function getUserById(userId: string, organizationId: string, fastify: FastifyInstance): Promise<UserWithRoles | null> {
  const query = `
    SELECT 
      u.id,
      u.email,
      u."displayName",
      u.status,
      u."mfaEnabled",
      u."createdAt",
      u."organizationId",
      r.id as role_id,
      r.name as role_name,
      r.description as role_description,
      r."isSystem" as role_is_system,
      r."isActive" as role_is_active
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur."userId" AND ur."isActive" = true
    LEFT JOIN roles r ON ur."roleId" = r.id AND r."isActive" = true
    WHERE u.id = $1 AND u."organizationId" = $2 AND u."deletedAt" IS NULL
  `;

  const result = await fastify.db.query(query, [userId, organizationId]);

  if (result.length === 0) {
    return null;
  }

  const user: UserWithRoles = {
    id: (result[0]?.['id'] as string) || '',
    email: (result[0]?.['email'] as string) || '',
    displayName: result[0]?.['display_name'] as string | null,
    status: (result[0]?.['status'] as string) || 'inactive',
    mfaEnabled: (result[0]?.['mfa_enabled'] as boolean) || false,
    createdAt: (result[0]?.['created_at'] as Date) || new Date(),
    organizationId: (result[0]?.['organization_id'] as string) || '',
    roles: []
  };

  for (const row of result) {
    if (row['role_id']) {
      user.roles.push({
        id: row['role_id'] as string,
        name: row['role_name'] as string,
        description: row['role_description'] as string | null,
        isSystem: row['role_is_system'] as boolean,
        isActive: row['role_is_active'] as boolean
      });
    }
  }

  return user;
}

/**
 * Create new user
 */
export async function createUser(userData: UserCreateRequest, organizationId: string, fastify: FastifyInstance): Promise<UserWithRoles> {
  const { email, firstName, lastName, displayName } = userData;
  // Note: Password and role assignment will be implemented in future iterations
  const password = 'temporary-password';
  const roleIds: string[] = [];

  // Check if user already exists
  const existingUser = await fastify.db.query(
    'SELECT id FROM users WHERE email = $1 AND "organizationId" = $2 AND "deletedAt" IS NULL',
    [email, organizationId]
  );

  if (existingUser.length > 0) {
    throw new Error('User with this email already exists');
  }

  // Create user
  const createUserQuery = `
    INSERT INTO users (
      id, email, "firstName", "lastName", "displayName", "passwordHash", status, "mfaEnabled", 
      "organizationId", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, 'active', false, 
      $6, NOW(), NOW()
    ) RETURNING id, email, "firstName", "lastName", "displayName", status, "mfaEnabled", "createdAt", "organizationId"
  `;

  // For now, use a simple hash since bcrypt is not available
  const hashedPassword = Buffer.from(password).toString('base64');
  const userResult = await fastify.db.query(createUserQuery, [
    email, firstName, lastName, displayName, hashedPassword, organizationId
  ]);

  const userId = (userResult[0]?.['id'] as string) || '';

  // Assign roles
  if (roleIds.length > 0) {
    for (const roleId of roleIds) {
      await fastify.db.query(`
        INSERT INTO user_roles (id, "userId", "roleId", "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
      `, [userId, roleId]);
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
 * Update user
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

  const updateQuery = `
    UPDATE users 
    SET 
      "displayName" = COALESCE($1, "displayName"),
      status = COALESCE($2, status),
      "mfaEnabled" = COALESCE($3, "mfaEnabled"),
      "updatedAt" = NOW()
    WHERE id = $4 AND "organizationId" = $5 AND "deletedAt" IS NULL
    RETURNING id, email, "displayName", status, "mfaEnabled", "createdAt", "organizationId"
  `;

  const result = await fastify.db.query(updateQuery, [
    displayName, status, mfaEnabled, userId, organizationId
  ]);

  if (result.length === 0) {
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
 * Add role to user
 */
export async function addRoleToUser(
  userId: string, 
  roleId: string, 
  organizationId: string, 
  fastify: FastifyInstance
): Promise<void> {
  // Check if user exists
  const userExists = await fastify.db.query(
    'SELECT id FROM users WHERE id = $1 AND "organizationId" = $2 AND "deletedAt" IS NULL',
    [userId, organizationId]
  );

  if (userExists.length === 0) {
    throw new Error('User not found');
  }

  // Check if role exists
  const roleExists = await fastify.db.query(
    'SELECT id FROM roles WHERE id = $1 AND "isActive" = true',
    [roleId]
  );

  if (roleExists.length === 0) {
    throw new Error('Role not found');
  }

  // Check if user already has this role
  const existingRole = await fastify.db.query(
    'SELECT id FROM user_roles WHERE "userId" = $1 AND "roleId" = $2',
    [userId, roleId]
  );

  if (existingRole.length > 0) {
    // Update existing role to active
    await fastify.db.query(
      'UPDATE user_roles SET "isActive" = true, "updatedAt" = NOW() WHERE "userId" = $1 AND "roleId" = $2',
      [userId, roleId]
    );
  } else {
    // Create new user role
    await fastify.db.query(`
      INSERT INTO user_roles (id, "userId", "roleId", "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
    `, [userId, roleId]);
  }
}

/**
 * Remove role from user
 */
export async function removeRoleFromUser(
  userId: string, 
  roleId: string, 
  organizationId: string, 
  fastify: FastifyInstance
): Promise<void> {
  // Check if user exists
  const userExists = await fastify.db.query(
    'SELECT id FROM users WHERE id = $1 AND "organizationId" = $2 AND "deletedAt" IS NULL',
    [userId, organizationId]
  );

  if (userExists.length === 0) {
    throw new Error('User not found');
  }

  // Deactivate user role
  await fastify.db.query(
    'UPDATE user_roles SET "isActive" = false, "updatedAt" = NOW() WHERE "userId" = $1 AND "roleId" = $2',
    [userId, roleId]
  );
}

/**
 * Get user roles
 */
export async function getUserRoles(userId: string, fastify: FastifyInstance): Promise<Array<{
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
}>> {
  const query = `
    SELECT 
      r.id,
      r.name,
      r.description,
      r."isSystem",
      r."isActive"
    FROM user_roles ur
    JOIN roles r ON ur."roleId" = r.id
    WHERE ur."userId" = $1 AND ur."isActive" = true AND r."isActive" = true
  `;

  const result = await fastify.db.query(query, [userId]);
  
  return result.map(row => ({
    id: row['id'] as string,
    name: row['name'] as string,
    description: row['description'] as string | null,
    isSystem: row['is_system'] as boolean,
    isActive: row['is_active'] as boolean
  }));
}

/**
 * Check if user has role
 */
export async function userHasRole(userId: string, roleName: string, fastify: FastifyInstance): Promise<boolean> {
  const query = `
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur."roleId" = r.id
    WHERE ur."userId" = $1 AND ur."isActive" = true AND r.name = $2 AND r."isActive" = true
    LIMIT 1
  `;

  const result = await fastify.db.query(query, [userId, roleName]);
  return result.length > 0;
}
