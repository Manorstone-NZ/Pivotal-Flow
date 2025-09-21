/**
 * PASETO Authentication Plugin
 * Replaces JWT authentication with secure PASETO + Opaque tokens
 */
import { PasetoTokenService } from '../lib/tokens/paseto-service.js';
import { AuthenticationError, AuthorizationError } from '../lib/error-handler.js';
import { logger } from '../lib/logger.js';
// Public routes that don't require authentication
const PUBLIC_ROUTES = [
    '/health',
    '/metrics',
    '/docs',
    '/docs/json',
    '/api/openapi.json',
    '/api/quotes-openapi.json',
    '/api/docs',
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/forgot-password',
    '/api/v1/auth/reset-password',
    '/api/v1/auth/verify-email'
];
// Public API routes (use PASETO public tokens)
const PUBLIC_API_ROUTES = [
    '/public/quotes/',
    '/public/invoices/',
    '/public/portal/'
];
// Routes that require authentication but no specific permissions
const AUTH_ONLY_ROUTES = [
    '/api/v1/auth/me',
    '/api/v1/auth/refresh',
    '/api/v1/auth/logout'
];
/**
 * Check if route is public (no authentication required)
 */
function isPublicRoute(url) {
    return PUBLIC_ROUTES.some(route => url.startsWith(route));
}
/**
 * Check if route is public API (uses public PASETO tokens)
 */
function isPublicApiRoute(url) {
    return PUBLIC_API_ROUTES.some(route => url.includes(route));
}
/**
 * Check if route only requires authentication (no permission check)
 */
function isAuthOnlyRoute(url) {
    return AUTH_ONLY_ROUTES.some(route => url.startsWith(route));
}
/**
 * Extract token binding information from request
 */
function extractTokenBinding(request) {
    return {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
        fingerprint: request.headers['x-client-fingerprint']
    };
}
/**
 * PASETO Authentication Plugin
 */
export const pasetoAuthPlugin = async (fastify) => {
    // Decorate fastify instance first
    fastify.decorateRequest('user', {});
    fastify.decorateRequest('session', {});
    // Initialize token service after database is available
    let tokenService;
    fastify.decorate('tokenService', {
        getter() {
            if (!tokenService) {
                tokenService = new PasetoTokenService(fastify);
            }
            return tokenService;
        }
    });
    fastify.decorateRequest('tokenService', {
        getter() {
            return fastify.tokenService;
        }
    });
    // Utility functions
    fastify.decorate('validateTenantMembership', async (userId, tenantId) => {
        try {
            const result = await fastify.db.execute(`
        SELECT 1 FROM memberships 
        WHERE user_id = $1 AND tenant_id = $2 AND status = 'ACTIVE'
      `, [userId, tenantId]);
            return result.length > 0;
        }
        catch (error) {
            logger.error({ err: error, userId, tenantId }, 'Failed to validate tenant membership');
            return false;
        }
    });
    fastify.decorate('getTenantRole', async (userId, tenantId) => {
        try {
            const result = await fastify.db.execute(`
        SELECT role FROM memberships 
        WHERE user_id = $1 AND tenant_id = $2 AND status = 'ACTIVE'
      `, [userId, tenantId]);
            return result[0]?.role || null;
        }
        catch (error) {
            logger.error({ err: error, userId, tenantId }, 'Failed to get tenant role');
            return null;
        }
    });
    // Main authentication hook
    fastify.addHook('preHandler', async (request, reply) => {
        const { method, url } = request;
        // Skip authentication for public routes
        if (isPublicRoute(url)) {
            return;
        }
        // Handle public API routes (PASETO public tokens)
        if (isPublicApiRoute(url)) {
            await handlePublicApiAuthentication(request, reply, tokenService);
            return;
        }
        // Extract token from Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('Bearer token required');
        }
        const token = authHeader.substring(7);
        const binding = extractTokenBinding(request);
        try {
            // Validate opaque access token
            const session = await tokenService.validateAccessToken(token, binding);
            if (!session) {
                throw new AuthenticationError('Invalid or expired token');
            }
            // Create authenticated user context
            request.user = {
                id: session.userId,
                tenantId: session.tenantId,
                organizationId: session.organizationId,
                roles: session.roles,
                permissions: session.permissions,
                memberships: session.memberships,
                sessionId: 'session-' + session.userId, // TODO: Add proper sessionId to SessionData interface
                lastActivity: session.lastActivity
            };
            request.session = session;
            // Validate tenant membership if switching tenants
            const requestedTenant = request.headers['x-tenant-id'];
            if (requestedTenant && requestedTenant !== session.tenantId) {
                const hasAccess = await fastify.validateTenantMembership(session.userId, requestedTenant);
                if (!hasAccess) {
                    throw new AuthorizationError('No access to requested tenant');
                }
                // Update user context for tenant switch
                request.user.tenantId = requestedTenant;
            }
            // Skip permission check for auth-only routes
            if (isAuthOnlyRoute(url)) {
                return;
            }
            // Permission checking will be handled by route-specific middleware
            // This allows for more granular permission control per endpoint
        }
        catch (error) {
            if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
                throw error;
            }
            logger.error({ err: error, url, method }, 'Authentication error');
            throw new AuthenticationError('Authentication failed');
        }
    });
    // Rate limiting hook for enhanced security
    fastify.addHook('preHandler', async (request, reply) => {
        if (isPublicRoute(request.url)) {
            return;
        }
        // Implement per-token rate limiting
        const token = request.headers.authorization?.substring(7);
        if (token && request.user) {
            const rateLimitKey = `rate_limit:${request.user.sessionId}:${request.method}:${request.url}`;
            try {
                const count = await fastify.redis.incr(rateLimitKey);
                if (count === 1) {
                    await fastify.redis.expire(rateLimitKey, 60); // 1 minute window
                }
                // Different limits for different types of operations
                const limit = getRateLimitForEndpoint(request.method, request.url);
                if (count > limit) {
                    reply.header('X-RateLimit-Limit', limit);
                    reply.header('X-RateLimit-Remaining', Math.max(0, limit - count));
                    reply.header('X-RateLimit-Reset', Date.now() + 60000);
                    throw new AuthorizationError('Rate limit exceeded');
                }
                reply.header('X-RateLimit-Limit', limit);
                reply.header('X-RateLimit-Remaining', Math.max(0, limit - count));
            }
            catch (error) {
                if (error instanceof AuthorizationError) {
                    throw error;
                }
                // Continue if rate limiting fails (don't break the request)
                logger.warn({ err: error }, 'Rate limiting check failed');
            }
        }
    });
    // Security headers hook
    fastify.addHook('onSend', async (request, reply, payload) => {
        // Add security headers
        reply.header('X-Content-Type-Options', 'nosniff');
        reply.header('X-Frame-Options', 'DENY');
        reply.header('X-XSS-Protection', '1; mode=block');
        reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        // Add tenant context to response headers for debugging
        if (request.user?.tenantId) {
            reply.header('X-Tenant-Context', request.user.tenantId);
        }
        return payload;
    });
};
/**
 * Handle public API authentication using PASETO public tokens
 */
async function handlePublicApiAuthentication(request, _reply, tokenService) {
    // Extract token from URL path (e.g., /public/quotes/:token)
    const pathParts = request.url.split('/');
    const tokenIndex = pathParts.findIndex(part => part === 'quotes' || part === 'invoices') + 1;
    if (tokenIndex === 0 || !pathParts[tokenIndex]) {
        throw new AuthenticationError('Public token required');
    }
    const token = pathParts[tokenIndex].split('?')[0]; // Remove query parameters
    const binding = extractTokenBinding(request);
    try {
        const payload = await tokenService.validatePublicToken(token || '', binding);
        if (!payload) {
            throw new AuthenticationError('Invalid or expired public token');
        }
        // Create minimal public context
        request.publicToken = {
            tenantId: payload.tenant,
            resourceId: payload.resource,
            resourceType: payload.resourceType,
            purpose: payload.purpose
        };
        // Check tenant feature entitlement
        const featureEnabled = await checkTenantFeature(payload.tenant, payload.resourceType);
        if (!featureEnabled) {
            throw new AuthorizationError('Feature not available for this tenant');
        }
    }
    catch (error) {
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
            throw error;
        }
        logger.error({ err: error, token: token?.substring(0, 8) + '...' || 'undefined' }, 'Public token validation failed');
        throw new AuthenticationError('Public token validation failed');
    }
}
/**
 * Check if a feature is enabled for a tenant
 */
async function checkTenantFeature(_tenantId, _featureCode) {
    // This would check the tenant_features table
    // For now, return true (all features enabled)
    return true;
}
/**
 * Get rate limit for specific endpoint
 */
function getRateLimitForEndpoint(method, path) {
    // Higher limits for read operations, lower for write operations
    if (method === 'GET') {
        return 100; // 100 requests per minute for reads
    }
    else if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        return 30; // 30 requests per minute for writes
    }
    else if (method === 'DELETE') {
        return 10; // 10 requests per minute for deletes
    }
    // Authentication endpoints get special treatment
    if (path.includes('/auth/')) {
        return 10; // 10 auth requests per minute
    }
    return 50; // Default limit
}
/**
 * Permission checking middleware factory
 */
export function requirePermission(permission) {
    return async (request, _reply) => {
        if (!request.user) {
            throw new AuthenticationError('Authentication required');
        }
        const hasPermission = request.user.permissions.includes(permission);
        if (!hasPermission) {
            logger.warn({
                userId: request.user.id,
                tenantId: request.user.tenantId,
                permission,
                userPermissions: request.user.permissions
            }, 'Permission denied');
            throw new AuthorizationError(`Missing permission: ${permission}`);
        }
    };
}
/**
 * Tenant membership checking middleware factory
 */
export function requireTenantMembership() {
    return async (request, _reply) => {
        if (!request.user) {
            throw new AuthenticationError('Authentication required');
        }
        const tenantId = request.user.tenantId;
        const hasAccess = await request.server.validateTenantMembership(request.user.id, tenantId);
        if (!hasAccess) {
            throw new AuthorizationError('No access to current tenant');
        }
    };
}
/**
 * Role checking middleware factory
 */
export function requireRole(role) {
    return async (request, _reply) => {
        if (!request.user) {
            throw new AuthenticationError('Authentication required');
        }
        const hasRole = request.user.roles.includes(role);
        if (!hasRole) {
            throw new AuthorizationError(`Missing role: ${role}`);
        }
    };
}
export default pasetoAuthPlugin;
//# sourceMappingURL=auth.paseto.js.map