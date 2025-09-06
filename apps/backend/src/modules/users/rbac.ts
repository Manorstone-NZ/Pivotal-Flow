// RBAC permission checks for users module

import { eq, and, isNull } from 'drizzle-orm';
import type { FastifyRequest, FastifyInstance } from 'fastify';

import { users } from '../../lib/schema.js';

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
export async function canViewUsers(user: UserContext, _fastify: FastifyInstance): Promise<PermissionCheck> {
  try {
    // Admin users have all permissions
    if (user.roles.includes('admin')) {
      return { hasPermission: true };
    }

    // For now, allow all authenticated users to view users
    // Admin users have all permissions
    return { hasPermission: true };
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
export async function canManageUsers(user: UserContext, _fastify: FastifyInstance): Promise<PermissionCheck> {
  try {
    // Admin users have all permissions
    if (user.roles.includes('admin')) {
      return { hasPermission: true };
    }

    // Only admin users can manage users
    return { 
      hasPermission: false, 
      reason: 'Only admin users can manage users' 
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
  targetUserId: string,
  fastify: FastifyInstance
): Promise<PermissionCheck> {
  try {
    // Check if target user exists in same organization
    const targetUserResult = await (fastify as any).db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, targetUserId),
          eq(users.organizationId, user.organizationId),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    const targetUser = targetUserResult[0];

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
    const viewCheck = await canViewUsers(user, fastify);
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
  targetUserId: string,
  fastify: FastifyInstance
): Promise<PermissionCheck> {
  try {
    // Check if target user exists in same organization
    const targetUserResult = await (fastify as any).db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, targetUserId),
          eq(users.organizationId, user.organizationId),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    const targetUser = targetUserResult[0];

    if (!targetUser) {
      return { 
        hasPermission: false, 
        reason: 'User not found in organization' 
      };
    }

    // Check if user has manage permission
    const manageCheck = await canManageUsers(user, fastify);
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
  // Type definition for authenticated user
  interface AuthenticatedUser {
    userId: string;
    organizationId: string;
    roles?: string[];
  }

  interface AuthenticatedRequest extends FastifyRequest {
    user: AuthenticatedUser;
  }

  const authenticatedRequest = request as AuthenticatedRequest;
  const user = authenticatedRequest.user;
  
  if (!user?.userId || !user?.organizationId) {
    throw new Error('User context not available');
  }

  return {
    userId: user.userId,
    organizationId: user.organizationId,
    roles: user.roles || []
  };
}
