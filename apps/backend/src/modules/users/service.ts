// User service layer - Prisma calls only, no HTTP logic

import { PrismaClient, Prisma } from '@prisma/client';
import type { UserPublic, UserCreateRequest, UserUpdateRequest, UserListSort } from '@pivotal-flow/shared/types/user';
import type { UserListFilters } from '../../types/database.js';

const prisma = new PrismaClient();

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

/**
 * List users with pagination and filters
 */
export async function listUsers(options: UserListOptions): Promise<UserListResult> {
  const { organizationId, filters = {}, sort = { field: 'createdAt', direction: 'desc' }, page, pageSize } = options;

  // Build where clause
  const where: Prisma.UserWhereInput = {
    organizationId,
    deletedAt: null,
    ...(filters.isActive !== undefined && { status: filters.isActive ? 'active' : 'inactive' }),
    ...(filters.q && {
      OR: [
        { email: { contains: filters.q, mode: 'insensitive' } },
        { displayName: { contains: filters.q, mode: 'insensitive' } }
      ]
    })
  };

  // Add role filter if specified
  if (filters.roleId) {
    where.userRoles = {
      some: {
        roleId: filters.roleId,
        isActive: true,
        role: { isActive: true }
      }
    };
  }

  // Build order by clause
  const orderBy: Prisma.UserOrderByWithRelationInput = {};
  if (sort.field === 'email') {
    orderBy.email = sort.direction;
  } else {
    orderBy.createdAt = sort.direction;
  }

  // Get total count
  const total = await prisma.user.count({ where });

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const skip = (page - 1) * pageSize;

  // Get users with roles
  const users = await prisma.user.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
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
  });

  // Transform to UserPublic format
  const items: UserPublic[] = users.map(user => ({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isActive: user.status === 'active',
    mfaEnabled: user.mfaEnabled,
    createdAt: user.createdAt,
    roles: user.userRoles.map(ur => ur.role)
  }));

  return { items, total, totalPages };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string, organizationId: string): Promise<UserPublic | null> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId,
      deletedAt: null
    },
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
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isActive: user.status === 'active',
    mfaEnabled: user.mfaEnabled,
    createdAt: user.createdAt,
    roles: user.userRoles.map(ur => ur.role)
  };
}

/**
 * Create new user
 */
export async function createUser(data: UserCreateRequest, organizationId: string): Promise<UserPublic> {
  // Normalize email to lowercase
  const normalizedEmail = data.email.toLowerCase();

  // Generate temporary random password hash (for SSO compatibility)
  const tempPasswordHash = `temp_${Math.random().toString(36).substring(2)}`;

  const user = await prisma.user.create({
    data: {
      ...data,
      email: normalizedEmail,
      passwordHash: tempPasswordHash,
      organizationId,
      status: 'active'
    },
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
  });

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isActive: user.status === 'active',
    mfaEnabled: user.mfaEnabled,
    createdAt: user.createdAt,
    roles: user.userRoles.map(ur => ur.role)
  };
}

/**
 * Update user profile fields
 */
export async function updateUser(
  userId: string, 
  organizationId: string, 
  data: UserUpdateRequest
): Promise<UserPublic | null> {
  const updateData: Prisma.UserUpdateInput = {};
  
  if (data.displayName !== undefined) {
    updateData.displayName = data.displayName;
  }
  
  if (data.isActive !== undefined) {
    updateData.status = data.isActive ? 'active' : 'inactive';
  }

  const user = await prisma.user.updateMany({
    where: {
      id: userId,
      organizationId,
      deletedAt: null
    },
    data: updateData
  });

  if (user.count === 0) return null;

  // Return updated user
  return getUserById(userId, organizationId);
}

/**
 * Assign role to user
 */
export async function assignRole(
  userId: string, 
  roleId: string, 
  organizationId: string, 
  assignedBy: string
): Promise<{ success: boolean; error?: string; message?: string; wasNewAssignment?: boolean }> {
  try {
    // Check if user exists in organization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
        deletedAt: null
      }
    });

    if (!user) {
      return { success: false, error: 'USER_NOT_FOUND', message: 'User not found in organization' };
    }

    // Check if role exists in organization
    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
        organizationId,
        isActive: true
      }
    });

    if (!role) {
      return { success: false, error: 'ROLE_NOT_FOUND', message: 'Role not found in organization' };
    }

    // Check if role is already assigned
    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
        organizationId,
        isActive: true
      }
    });

    const wasNewAssignment = !existingUserRole;

    // Create or update user role (idempotent)
    await prisma.userRole.upsert({
      where: {
        userId_roleId_organizationId: {
          userId,
          roleId,
          organizationId
        }
      },
      update: {
        isActive: true,
        assignedBy,
        assignedAt: new Date()
      },
      create: {
        userId,
        roleId,
        organizationId,
        assignedBy,
        assignedAt: new Date()
      }
    });

    return { success: true, wasNewAssignment };
  } catch (error) {
    return { success: false, error: 'INTERNAL_ERROR', message: 'Failed to assign role' };
  }
}

/**
 * Remove role from user
 */
export async function removeRole(
  userId: string, 
  roleId: string, 
  organizationId: string
): Promise<{ success: boolean; error?: string; message?: string; wasRemoved?: boolean }> {
  try {
    // Check if user exists in organization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
        deletedAt: null
      }
    });

    if (!user) {
      return { success: false, error: 'USER_NOT_FOUND', message: 'User not found in organization' };
    }

    // Check if role exists in organization
    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
        organizationId,
        isActive: true
      }
    });

    if (!role) {
      return { success: false, error: 'ROLE_NOT_FOUND', message: 'Role not found in organization' };
    }

    // Check if role is currently assigned
    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
        organizationId,
        isActive: true
      }
    });

    if (!existingUserRole) {
      return { success: true, wasRemoved: false, message: 'Role was not assigned to user' };
    }

    // Remove role
    const result = await prisma.userRole.updateMany({
      where: {
        userId,
        roleId,
        organizationId,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    return { success: true, wasRemoved: result.count > 0 };
  } catch (error) {
    return { success: false, error: 'INTERNAL_ERROR', message: 'Failed to remove role' };
  }
}

/**
 * Check if role exists in organization
 */
export async function roleExists(roleId: string, organizationId: string): Promise<boolean> {
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      organizationId,
      isActive: true
    }
  });

  return !!role;
}
