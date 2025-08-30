// RBAC permission checks for users module

import type { FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserContext {
  userId: string;
  organizationId: string;
  roles: string[];
}

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
}

/**
 * Check if user has users.view permission
 */
export async function canViewUsers(user: UserContext): Promise<PermissionCheck> {
  try {
    // Admin users have all permissions
    if (user.roles.includes('admin')) {
      return { hasPermission: true };
    }

    // Check if user has any role with users.view permission
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: user.userId,
        organizationId: user.organizationId,
        isActive: true,
        role: {
          isActive: true,
          permissions: {
            array_contains: ['users.view']
          }
        }
      },
      include: {
        role: true
      }
    });

    if (userRoles.length > 0) {
      return { hasPermission: true };
    }

    return { 
      hasPermission: false, 
      reason: 'No role with users.view permission found' 
    };
  } catch (error) {
    return { 
      hasPermission: false, 
      reason: 'Error checking permissions' 
    };
  }
}

/**
 * Check if user has users.manage permission
 */
export async function canManageUsers(user: UserContext): Promise<PermissionCheck> {
  try {
    // Admin users have all permissions
    if (user.roles.includes('admin')) {
      return { hasPermission: true };
    }

    // Check if user has any role with users.manage permission
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: user.userId,
        organizationId: user.organizationId,
        isActive: true,
        role: {
          isActive: true,
          permissions: {
            array_contains: ['users.manage']
          }
        }
      },
      include: {
        role: true
      }
    });

    if (userRoles.length > 0) {
      return { hasPermission: true };
    }

    return { 
      hasPermission: false, 
      reason: 'No role with users.manage permission found' 
    };
  } catch (error) {
    return { 
      hasPermission: false, 
      reason: 'Error checking permissions' 
    };
  }
}

/**
 * Check if user can access a specific user (same organization)
 */
export async function canAccessUser(
  user: UserContext, 
  targetUserId: string
): Promise<PermissionCheck> {
  try {
    // Check if target user exists in same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        organizationId: user.organizationId,
        deletedAt: null
      }
    });

    if (!targetUser) {
      return { 
        hasPermission: false, 
        reason: 'User not found in organization' 
      };
    }

    // Users can always view themselves
    if (user.userId === targetUserId) {
      return { hasPermission: true };
    }

    // Check if user has view permission
    const viewCheck = await canViewUsers(user);
    if (viewCheck.hasPermission) {
      return { hasPermission: true };
    }

    return { 
      hasPermission: false, 
      reason: 'Insufficient permissions to access user' 
    };
  } catch (error) {
    return { 
      hasPermission: false, 
      reason: 'Error checking user access' 
    };
  }
}

/**
 * Check if user can modify a specific user
 */
export async function canModifyUser(
  user: UserContext, 
  targetUserId: string
): Promise<PermissionCheck> {
  try {
    // Check if target user exists in same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        organizationId: user.organizationId,
        deletedAt: null
      }
    });

    if (!targetUser) {
      return { 
        hasPermission: false, 
        reason: 'User not found in organization' 
      };
    }

    // Check if user has manage permission
    const manageCheck = await canManageUsers(user);
    if (manageCheck.hasPermission) {
      return { hasPermission: true };
    }

    return { 
      hasPermission: false, 
      reason: 'Insufficient permissions to modify user' 
    };
  } catch (error) {
    return { 
      hasPermission: false, 
      reason: 'Error checking modification permissions' 
    };
  }
}

/**
 * Extract user context from Fastify request
 */
export function extractUserContext(request: FastifyRequest): UserContext {
  const user = request.user as any;
  
  if (!user?.userId || !user?.organizationId) {
    throw new Error('User context not available');
  }

  return {
    userId: user.userId,
    organizationId: user.organizationId,
    roles: user.roles || []
  };
}
