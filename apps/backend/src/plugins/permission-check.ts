/**
 * Permission Check Plugin
 * Adds middleware to validate user permissions for protected routes
 */

import type { FastifyInstance, FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

import { ROUTE_PERMISSIONS } from '../lib/access-control.js';

interface User {
  userId: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  jti?: string;
}

interface AuthenticatedRequest extends FastifyRequest {
  user: User;
}

/**
 * Get the required permission for a route
 */
function getRequiredPermission(method: string, url: string): string | null {
  // Remove query parameters and normalize URL
  const cleanUrl = url.split('?')[0].replace(/\/api\/v1/, '');
  const routeKey = `${method} ${cleanUrl}`;
  
  // console.log(`🔍 Permission check: ${method} ${url} -> ${routeKey}`);
  
  // Check exact matches first
  if (ROUTE_PERMISSIONS[routeKey as keyof typeof ROUTE_PERMISSIONS]) {
    return ROUTE_PERMISSIONS[routeKey as keyof typeof ROUTE_PERMISSIONS];
  }
  
  // Check pattern matches (for routes with parameters)
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (permission && route.includes(':')) {
      const [routeMethod, routePath] = route.split(' ');
      if (routeMethod === method) {
        // Convert route pattern to regex
        const regexPattern = routePath
          .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
          .replace(/\//g, '\\/'); // Escape forward slashes
        
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(cleanUrl)) {
          return permission as string;
        }
      }
    }
  }
  
  return null;
}

/**
 * Check if user has the required permission
 */
function hasPermission(user: User, requiredPermission: string): boolean {
  // Super admin gets everything
  if (user.roles.includes('super_admin') || user.roles.includes('admin')) {
    return true;
  }
  
  // Check if user has the specific permission
  if (user.permissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check for tenant admin permissions
  if (user.roles.includes('tenant_admin')) {
    const tenantPermissions = [
      'Tenant Admin Access',
      'Manage Users',
      'Manage Customers',
      'Manage Projects', 
      'Manage Quotes',
      'View Reports'
    ];
    return tenantPermissions.includes(requiredPermission);
  }
  
  return false;
}

const permissionCheckPlugin: FastifyPluginCallback = async (fastify: FastifyInstance) => {
  // Add permission check hook after authentication
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const { method, url } = request;
    
    // Skip permission check for public routes
    const publicRoutes = ['/health', '/auth/login', '/auth/register', '/auth/refresh', '/auth/me', '/public/quotes'];
    const isPublicRoute = publicRoutes.some(route => url.includes(route));
    
    if (isPublicRoute) {
      return;
    }
    
    // Skip if no user (auth plugin should have handled this)
    const user = (request as AuthenticatedRequest).user;
    if (!user) {
      return;
    }
    
    // Get required permission for this route
    const requiredPermission = getRequiredPermission(method, url);
    
    // If no permission required, allow access
    if (!requiredPermission) {
      return;
    }
    
    // Check if user has the required permission
    if (!hasPermission(user, requiredPermission)) {
      fastify.log.warn({
        userId: user.userId,
        method,
        url,
        requiredPermission,
        userPermissions: user.permissions,
        userRoles: user.roles
      }, 'Permission denied');

      // Simple audit logging for permission denial
      fastify.log.warn({
        audit: {
          action: 'permission.denied',
          userId: user.userId,
          organizationId: user.organizationId,
          requiredPermission,
          route: url,
          userRoles: user.roles,
          userPermissions: user.permissions.slice(0, 3),
        }
      }, '🚫 Permission denied - audit logged');
      
      return reply.status(403).send({
        error: 'Forbidden',
        message: `Insufficient permissions. Required: ${requiredPermission}`,
        code: 'PERMISSION_DENIED'
      });
    }
    
    // Log successful permission check
    fastify.log.info({
      audit: {
        action: 'permission.granted',
        userId: user.userId,
        organizationId: user.organizationId,
        requiredPermission,
        route: url,
      }
    }, '✅ Permission granted - audit logged');
  });
};

export default fp(permissionCheckPlugin, {
  name: 'permission-check'
});
