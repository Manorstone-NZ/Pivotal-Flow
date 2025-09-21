/**
 * Auth Repository with Drizzle
 * Replaces raw SQL in auth paths with tenant-safe Drizzle queries
 */

import { eq, and, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { users, roles, userRoles, rolePermissions, permissions, memberships, tenants } from '../lib/schema.js';
import { logger } from '../lib/logger.js';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  permissions: string[];
  organizationId: string;
  tenantId: string;
  memberships: Array<{
    tenantId: string;
    role: string;
  }>;
}

export class AuthRepository {
  constructor(private fastify: FastifyInstance) {}
  
  private get db() {
    return (this.fastify as any).db;
  }
  
  /**
   * Find user by email with tenant context
   */
  async findUserByEmail(tenantId: string, email: string): Promise<{
    id: string;
    email: string;
    displayName: string;
    status: string;
    passwordHash: string;
    organizationId: string;
  } | null> {
    try {
      const result = await this.db
        .select({
          id: users.id,
          email: users.email,
          displayName: users.displayName,
          status: users.status,
          passwordHash: users.passwordHash,
          organizationId: users.organizationId
        })
        .from(users)
        .where(
          and(
            eq(users.email, email.toLowerCase()),
            eq(users.status, 'active'),
            eq(users.organizationId, tenantId) // Tenant-scoped lookup
          )
        )
        .limit(1);
        
      return result[0] || null;
    } catch (error) {
      logger.error({ err: error, tenantId, email }, 'Failed to find user by email');
      throw error;
    }
  }
  
  /**
   * Get user with full auth context (roles, permissions, memberships)
   */
  async getUserAuthContext(userId: string, tenantId: string): Promise<AuthUser | null> {
    try {
      // Get user basic info
      const userResult = await this.db
        .select({
          id: users.id,
          email: users.email,
          displayName: users.displayName,
          organizationId: users.organizationId
        })
        .from(users)
        .where(
          and(
            eq(users.id, userId),
            eq(users.status, 'active'),
            eq(users.organizationId, tenantId) // Tenant-scoped
          )
        )
        .limit(1);
        
      if (!userResult[0]) {
        return null;
      }
      
      const user = userResult[0];
      
      // Get user roles in this tenant
      const rolesResult = await this.db
        .select({
          name: roles.name
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.isActive, true),
            eq(roles.isActive, true),
            eq(userRoles.organizationId, tenantId) // Tenant-scoped roles
          )
        );
      
      const userRolesList = rolesResult.map(r => r.name);
      
      // Get user permissions through roles in this tenant
      const permissionsResult = await this.db
        .select({
          name: permissions.name
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.isActive, true),
            eq(roles.isActive, true),
            eq(userRoles.organizationId, tenantId) // Tenant-scoped permissions
          )
        );
      
      const userPermissionsList = permissionsResult.map(p => p.name);
      
      // Get all user memberships (cross-tenant)
      const membershipsResult = await this.db
        .select({
          tenantId: memberships.tenantId,
          role: memberships.role
        })
        .from(memberships)
        .where(
          and(
            eq(memberships.userId, userId),
            eq(memberships.status, 'ACTIVE')
          )
        );
      
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles: userRolesList,
        permissions: userPermissionsList,
        organizationId: user.organizationId,
        tenantId: tenantId,
        memberships: membershipsResult
      };
      
    } catch (error) {
      logger.error({ err: error, userId, tenantId }, 'Failed to get user auth context');
      throw error;
    }
  }
  
  /**
   * Check if user has membership in tenant
   */
  async hasUserMembership(userId: string, tenantId: string): Promise<boolean> {
    try {
      const result = await this.db
        .select({ id: memberships.id })
        .from(memberships)
        .where(
          and(
            eq(memberships.userId, userId),
            eq(memberships.tenantId, tenantId),
            eq(memberships.status, 'ACTIVE')
          )
        )
        .limit(1);
        
      return result.length > 0;
    } catch (error) {
      logger.error({ err: error, userId, tenantId }, 'Failed to check user membership');
      return false;
    }
  }
  
  /**
   * Get user role in specific tenant
   */
  async getUserTenantRole(userId: string, tenantId: string): Promise<string | null> {
    try {
      const result = await this.db
        .select({ role: memberships.role })
        .from(memberships)
        .where(
          and(
            eq(memberships.userId, userId),
            eq(memberships.tenantId, tenantId),
            eq(memberships.status, 'ACTIVE')
          )
        )
        .limit(1);
        
      return result[0]?.role || null;
    } catch (error) {
      logger.error({ err: error, userId, tenantId }, 'Failed to get user tenant role');
      return null;
    }
  }
  
  /**
   * Validate tenant exists and is active
   */
  async validateTenant(tenantId: string): Promise<boolean> {
    try {
      const result = await this.db
        .select({ id: tenants.id })
        .from(tenants)
        .where(
          and(
            eq(tenants.id, tenantId),
            eq(tenants.status, 'ACTIVE')
          )
        )
        .limit(1);
        
      return result.length > 0;
    } catch (error) {
      logger.error({ err: error, tenantId }, 'Failed to validate tenant');
      return false;
    }
  }
  
  /**
   * Get user's active memberships
   */
  async getUserMemberships(userId: string): Promise<Array<{
    tenantId: string;
    tenantName: string;
    role: string;
    status: string;
  }>> {
    try {
      const result = await this.db
        .select({
          tenantId: memberships.tenantId,
          tenantName: tenants.name,
          role: memberships.role,
          status: memberships.status
        })
        .from(memberships)
        .innerJoin(tenants, eq(memberships.tenantId, tenants.id))
        .where(
          and(
            eq(memberships.userId, userId),
            eq(memberships.status, 'ACTIVE'),
            eq(tenants.status, 'ACTIVE')
          )
        )
        .orderBy(tenants.name);
        
      return result;
    } catch (error) {
      logger.error({ err: error, userId }, 'Failed to get user memberships');
      return [];
    }
  }
  
  /**
   * Update user last login timestamp
   */
  async updateUserLastLogin(userId: string): Promise<void> {
    try {
      await this.db
        .update(users)
        .set({ 
          lastLoginAt: new Date(),
          loginCount: sql`${users.loginCount} + 1` // Use SQL increment
        })
        .where(eq(users.id, userId));
        
      logger.debug({ userId }, 'User last login updated');
    } catch (error) {
      logger.error({ err: error, userId }, 'Failed to update user last login');
      // Don't throw - login should succeed even if this fails
    }
  }
  
  /**
   * Record failed login attempt
   */
  async recordFailedLogin(email: string, ipAddress?: string): Promise<void> {
    try {
      // This could be stored in a separate failed_logins table
      // For now, just log it
      logger.warn({ 
        email, 
        ipAddress,
        timestamp: new Date().toISOString()
      }, 'Failed login attempt recorded');
    } catch (error) {
      logger.error({ err: error, email }, 'Failed to record failed login');
    }
  }
}
