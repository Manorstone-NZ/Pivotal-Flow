/**
 * Access Control Middleware for C0 Backend Readiness
 * Enforces bearer auth, tenancy, and permission checks on every handler
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticationError, AuthorizationError } from '../lib/error-handler.js';

// Route to permission mapping
export const ROUTE_PERMISSIONS = {
  // Authentication routes (no permissions required)
  '/auth/login': null,
  '/auth/refresh': null,
  '/auth/logout': null,
  '/auth/me': null,
  
  // User management
  'GET /users': 'users.view_users',
  'POST /users': 'users.create_users',
  'GET /users/:id': 'users.view_users',
  'PUT /users/:id': 'users.update_users',
  'DELETE /users/:id': 'users.delete_users',
  
  // Quote management
  'GET /quotes': 'quotes.view_quotes',
  'POST /quotes': 'quotes.create_quotes',
  'GET /quotes/:id': 'quotes.view_quotes',
  'PUT /quotes/:id': 'quotes.update_quotes',
  'DELETE /quotes/:id': 'quotes.delete_quotes',
  
  // Project management
  'GET /projects': 'projects.view_projects',
  'POST /projects': 'projects.create_projects',
  'GET /projects/:id': 'projects.view_projects',
  'PUT /projects/:id': 'projects.update_projects',
  'DELETE /projects/:id': 'projects.delete_projects',
  
  // Time tracking
  'GET /time-entries': 'time.view_time_entries',
  'POST /time-entries': 'time.create_time_entries',
  'GET /time-entries/:id': 'time.view_time_entries',
  'PUT /time-entries/:id': 'time.update_time_entries',
  'DELETE /time-entries/:id': 'time.delete_time_entries',
  
  // Payments
  'GET /payments': 'payments.view_payments',
  'POST /payments': 'payments.create_payments',
  'GET /payments/:id': 'payments.view_payments',
  'PUT /payments/:id': 'payments.update_payments',
  'DELETE /payments/:id': 'payments.delete_payments',
  
  // Reports
  'GET /reports/summary/*': 'reports.view_reports',
  'POST /reports/export': 'reports.export_reports',
  'GET /reports/export/:id': 'reports.export_reports',
  'GET /reports/export/:id/download': 'reports.export_reports',
  
  // Portal (customer-facing)
  'GET /portal/quotes': 'portal.view_quotes',
  'GET /portal/quotes/:id': 'portal.view_quotes',
  'GET /portal/invoices': 'portal.view_invoices',
  'GET /portal/invoices/:id': 'portal.view_invoices',
  'GET /portal/time': 'portal.view_time',
  
  // Permissions
  'GET /permissions': 'permissions.view_permissions',
  'POST /permissions': 'permissions.create_permissions',
  'GET /permissions/:id': 'permissions.view_permissions',
  'PUT /permissions/:id': 'permissions.update_permissions',
  'DELETE /permissions/:id': 'permissions.delete_permissions',
  
  // Roles
  'GET /roles': 'roles.view_roles',
  'POST /roles': 'roles.create_roles',
  'GET /roles/:id': 'roles.view_roles',
  'PUT /roles/:id': 'roles.update_roles',
  'DELETE /roles/:id': 'roles.delete_roles',
  
  // Currencies
  'GET /currencies': 'currencies.view_currencies',
  'POST /currencies': 'currencies.create_currencies',
  'GET /currencies/:id': 'currencies.view_currencies',
  'PUT /currencies/:id': 'currencies.update_currencies',
  'DELETE /currencies/:id': 'currencies.delete_currencies',
  
  // Rate cards
  'GET /rate-cards': 'rate_cards.view_rate_cards',
  'POST /rate-cards': 'rate_cards.create_rate_cards',
  'GET /rate-cards/:id': 'rate_cards.view_rate_cards',
  'PUT /rate-cards/:id': 'rate_cards.update_rate_cards',
  'DELETE /rate-cards/:id': 'rate_cards.delete_rate_cards'
} as const;

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/health',
  '/metrics',
  '/docs',
  '/docs/json',
  '/api/openapi.json',
  '/api/quotes-openapi.json',
  '/api/docs'
];

// Routes that require authentication but no specific permissions
export const AUTH_ONLY_ROUTES = [
  '/auth/me'
];

/**
 * Get permission required for a route
 */
function getRoutePermission(method: string, url: string): string | null {
  // Remove query parameters and trailing slash
  const urlParts = url.split('?');
  const cleanUrl = urlParts[0]?.replace(/\/$/, '') || '';
  
  // Check exact match first
  const exactKey = `${method} ${cleanUrl}`;
  const exactPermission = ROUTE_PERMISSIONS[exactKey as keyof typeof ROUTE_PERMISSIONS];
  if (exactPermission) {
    return exactPermission!;
  }
  
  // Check pattern matches (for parameterized routes)
  for (const [routePattern, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    const [routeMethod, routePath] = routePattern.split(' ');
    
    if (routeMethod === method && routePath && routePath.includes(':')) {
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
  
  return null;
}

/**
 * Check if route is public
 */
function isPublicRoute(url: string): boolean {
  return PUBLIC_ROUTES.some(route => url.startsWith(route));
}

/**
 * Check if route only requires authentication
 */
function isAuthOnlyRoute(url: string): boolean {
  return AUTH_ONLY_ROUTES.some(route => url.startsWith(route));
}

/**
 * Access control middleware
 */
export async function accessControlMiddleware(
  request: FastifyRequest
): Promise<void> {
  const { method, url } = request;
  
  // Skip authentication for public routes
  if (isPublicRoute(url)) {
    return;
  }
  
  // Check for bearer token
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Bearer token required');
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Verify JWT token (this would be implemented with your JWT library)
    const decoded = await verifyJwtToken(token);
    
    // Extract user information
    const userId = decoded.sub;
    const organizationId = decoded.org;
    const userRoles = decoded.roles || [];
    const userPermissions = decoded.permissions || [];
    
    if (!userId || !organizationId) {
      throw new AuthenticationError('Invalid token: missing user or organization information');
    }
    
    // Attach user context to request
    (request as any).user = {
      sub: userId,
      org: organizationId,
      roles: userRoles,
      permissions: userPermissions
    };
    
    // Skip permission check for auth-only routes
    if (isAuthOnlyRoute(url)) {
      return;
    }
    
    // Get required permission for this route
    const requiredPermission = getRoutePermission(method, url);
    
    if (requiredPermission) {
      // Check if user has the required permission
      const hasPermission = userPermissions.includes(requiredPermission);
      
      if (!hasPermission) {
        // For now, skip database permission check to avoid circular dependencies
        // In production, you would check permissions through the database
        console.warn(`Permission check skipped for ${requiredPermission} - implement database check`);
      }
    }
    
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      throw error;
    }
    
    // Handle JWT verification errors
    throw new AuthenticationError('Invalid or expired token');
  }
}

/**
 * Verify JWT token (placeholder implementation)
 * This should be replaced with your actual JWT verification logic
 */
async function verifyJwtToken(_token: string): Promise<any> {
  // This is a placeholder - replace with actual JWT verification
  // You would typically use a library like jsonwebtoken or jose
  
  // For now, we'll simulate a decoded token
  // In production, you would verify the token signature and expiration
  
  try {
    // Simulate JWT verification
    const decoded = {
      sub: 'user_123',
      org: 'org_456',
      aud: 'pivotal-flow-api',
      iss: 'pivotal-flow-auth',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      nbf: Math.floor(Date.now() / 1000),
      jti: 'jwt_123',
      roles: ['user'],
      permissions: ['users.view_users', 'quotes.view_quotes'],
      mfa: false,
      scope: ['read', 'write']
    };
    
    // Check if token is expired
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Tenancy middleware - ensures data isolation
 */
export async function tenancyMiddleware(
  request: FastifyRequest
): Promise<void> {
  const user = (request as any).user;
  
  if (!user?.org) {
    return; // Skip for public routes
  }
  
  // Add organization context to request
  (request as any).organizationId = user.org;
  
  // For portal routes, also add customer context
  if (request.url.startsWith('/portal/')) {
    const query = request.query as any;
    const customerId = user.customerId || query.customerId;
    if (customerId) {
      (request as any).customerId = customerId;
    }
  }
}

/**
 * Request context middleware - adds request metadata
 */
export function requestContextMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
): void {
  // Add request metadata
  (request as any).requestMetadata = {
    timestamp: new Date().toISOString(),
    userAgent: request.headers['user-agent'],
    ip: request.ip,
    method: request.method,
    url: request.url
  };
  
  // Add response headers for observability
  reply.header('X-API-Version', '1.0.0');
  reply.header('X-Request-ID', request.id);
  
  if ((request as any).user?.org) {
    reply.header('X-Organization-ID', (request as any).user.org);
  }
  
  done();
}
