import cookie from '@fastify/cookie';
// import jwt from '@fastify/jwt'; // Removed - using PASETO v4 only per F1.5
import rateLimit from '@fastify/rate-limit';
import { TokenManager } from '@pivotal-flow/shared';
import fp from 'fastify-plugin';
import { config } from '../../config/index.js';
import { logger } from '../../lib/logger.js';
import { createTokenManager } from './tokens.js';
/**
 * F1: Validate tenant membership for the current user
 */
function validateTenantMembership(user, requiredTenantId) {
    // If no specific tenant required, user must have at least one membership
    if (!requiredTenantId) {
        return user.memberships.length > 0;
    }
    // Check if user has membership in the required tenant
    return user.memberships.some(membership => membership.tenantId === requiredTenantId);
}
/**
 * Parse TTL string to seconds
 */
function parseTTL(ttl) {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) {
        return 900; // Default to 15 minutes
    }
    const value = parseInt(match[1] ?? '0', 10);
    const unit = match[2];
    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 3600;
        case 'd': return value * 86400;
        default: return 900;
    }
}
export default fp(async function authPlugin(app) {
    // Register cookie plugin first
    await app.register(cookie, {
        secret: config.auth.COOKIE_SECRET,
        parseOptions: {
            httpOnly: true,
            secure: config.auth.COOKIE_SECURE,
            sameSite: 'lax',
            path: '/',
        },
    });
    // JWT removed - using PASETO v4 only per F1.5 requirements
    // TODO: Complete PASETO v4.public (access) and v4.local (refresh) implementation
    // Register session verification
    const { registerSessionVerification } = await import('../../lib/auth/session-verification.js');
    await registerSessionVerification(app);
    // Register rate limiting for auth routes with tiers
    await app.register(rateLimit, {
        max: config.rateLimit.RATE_LIMIT_UNAUTH_MAX, // Default for unauthenticated
        timeWindow: config.rateLimit.RATE_LIMIT_WINDOW,
        keyGenerator: (request) => {
            // Use IP for unauthenticated routes, user ID for authenticated
            const user = request.user;
            return user?.userId ?? request.ip;
        },
        errorResponseBuilder: (_request, context) => {
            const retryAfter = Math.ceil(Number(context.after) / 1000);
            return {
                error: 'Too Many Requests',
                message: `Rate limit exceeded, retry in ${retryAfter} seconds`,
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter,
            };
        },
        // Custom rate limiting logic
        onExceeded: (request, context) => {
            const user = request.user;
            const route = request.url;
            // Log rate limit violations for security monitoring
            logger.warn({
                userId: user?.userId,
                ip: request.ip,
                route,
                limit: context.limit,
                current: context.current,
                window: context.window,
                message: 'Rate limit exceeded'
            });
        },
    });
    // Redis is now handled by the cache plugin, so we don't need to create a separate instance
    // The cache plugin decorates the app with 'cache' instead of 'redis'
    // Add route-specific rate limiting for sensitive endpoints
    app.addHook('onRequest', async (request) => {
        const route = request.url;
        // Apply stricter rate limiting for login attempts
        if (route === '/v1/auth/login') {
            // Note: Rate limiting is now handled by the cache plugin
            // This is a placeholder for future rate limiting implementation
        }
    });
    // Create the TokenManager only after JWT is ready
    const tokenManager = createTokenManager(app);
    // Create TokenManager for refresh token storage
    const cacheAdapter = {
        get: (key) => Promise.resolve(app.cache?.get(key) ?? null),
        set: (key, value, _mode, ttl) => Promise.resolve(app.cache?.set(key, value, ttl) ?? true),
        del: (key) => Promise.resolve(app.cache?.delete(key) ?? true)
    };
    const refreshTokenManager = new TokenManager(cacheAdapter, parseTTL(config.auth.REFRESH_TOKEN_TTL));
    app.decorate('tokenManager', tokenManager);
    app.decorate('refreshTokenManager', refreshTokenManager);
    // F1: Decorate app with tenant membership utilities
    app.decorate('validateTenantMembership', async function (_userId, _tenantId) {
        // This is a simplified version for Fastify decorator compatibility
        // The actual implementation would need to fetch user data from database
        return true; // TODO: Implement proper tenant membership validation
    });
    app.decorate('getTenantRole', async function (_userId, _tenantId) {
        // This is a simplified version for Fastify decorator compatibility
        // The actual implementation would need to fetch user data from database
        return null; // TODO: Implement proper tenant role retrieval
    });
    // Add JWT verification preHandler
    app.addHook('preHandler', async (request, reply) => {
        // Skip JWT verification for public routes
        const requestUrl = request.url;
        // Debug logging for troubleshooting
        if (requestUrl === '/test/manual' || requestUrl === '/api/openapi.json') {
            logger.info({
                requestUrl,
                method: request.method,
                url: request.url
            }, 'Processing auth check for manual route');
        }
        // Simple and direct public route checking
        if (requestUrl === '/test/manual' ||
            requestUrl === '/api/openapi.json' ||
            requestUrl === '/api/quotes-docs.json' ||
            requestUrl === '/api/quotes-openapi.json' ||
            requestUrl === '/api/docs' ||
            requestUrl === '/health' ||
            requestUrl === '/api/v1/health' ||
            requestUrl === '/api/v1/health/ping' ||
            requestUrl === '/health/cache' ||
            requestUrl === '/metrics' ||
            requestUrl === '/' ||
            requestUrl.startsWith('/docs') ||
            requestUrl === '/v1/auth/login' ||
            requestUrl === '/api/v1/auth/login' ||
            requestUrl === '/v1/auth/refresh' ||
            requestUrl === '/api/v1/auth/refresh' ||
            requestUrl === '/api/v1/auth/login-opaque' ||
            requestUrl === '/api/v1/auth/logout-opaque' ||
            requestUrl === '/api/v1/auth/login-paseto' ||
            requestUrl === '/api/v1/auth/refresh-paseto' ||
            requestUrl === '/api/v1/auth/logout-paseto' ||
            requestUrl === '/api/v1/auth/debug-db' ||
            requestUrl.startsWith('/v1/test/') ||
            requestUrl.startsWith('/api/public/quotes/')) {
            logger.info({ requestUrl }, 'Skipping auth for public route');
            return;
        }
        try {
            await request.jwtVerify();
            // F1: Extract enhanced user context from JWT payload with tenant memberships
            const payload = request.user;
            const enhancedUser = {
                userId: payload.sub,
                organizationId: payload.org, // Legacy compatibility
                tenantId: payload.tenantId || payload.org, // Current active tenant (fallback to org for legacy)
                memberships: payload.memberships ?? [], // All tenant memberships
                roles: payload.roles ?? [], // Legacy roles
                permissions: payload.permissions ?? [], // Permissions for current tenant
                jti: payload.jti,
            };
            // F1: Validate tenant membership - user must have at least one membership (only if memberships exist)
            if (enhancedUser.memberships.length > 0 && !validateTenantMembership(enhancedUser)) {
                logger.warn({
                    userId: enhancedUser.userId,
                    memberships: enhancedUser.memberships,
                    requestUrl: request.url
                }, 'F1: Access denied - no valid tenant memberships');
                return reply.status(403).send({
                    error: 'Forbidden',
                    message: 'No valid tenant memberships found',
                    code: 'NO_TENANT_MEMBERSHIP',
                });
            }
            // F1: Validate current tenant membership (only if memberships exist)
            if (enhancedUser.memberships.length > 0 && enhancedUser.tenantId && !validateTenantMembership(enhancedUser, enhancedUser.tenantId)) {
                logger.warn({
                    userId: enhancedUser.userId,
                    tenantId: enhancedUser.tenantId,
                    memberships: enhancedUser.memberships,
                    requestUrl: request.url
                }, 'F1: Access denied - no membership in current tenant');
                return reply.status(403).send({
                    error: 'Forbidden',
                    message: `No membership found for tenant: ${enhancedUser.tenantId}`,
                    code: 'INVALID_TENANT_MEMBERSHIP',
                });
            }
            // Provide both enhanced and legacy user interfaces for backward compatibility
            request.user = enhancedUser;
            // Legacy compatibility: Also provide the old user interface
            request.legacyUser = {
                userId: enhancedUser.userId,
                organizationId: enhancedUser.organizationId,
                roles: enhancedUser.roles,
                id: enhancedUser.userId, // Some modules expect user.id instead of user.userId
            };
        }
        catch (err) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN',
            });
        }
    });
    // Add postHandler to apply different rate limits based on authentication
    app.addHook('onResponse', async (request) => {
        const user = request.user;
        const route = request.url;
        // Skip for public routes
        if (['/health', '/metrics', '/docs', '/docs/json', '/api/openapi.json', '/test/manual', '/'].includes(route)) {
            return;
        }
        // Apply different rate limits based on user role
        if (user?.userId) {
            // Note: Rate limiting is now handled by the cache plugin
            // This is a placeholder for future rate limiting implementation
            // Admin users get higher limits
            if (user.roles?.includes('admin')) {
                // Note: Rate limiting is now handled by the @fastify/rate-limit plugin
                // This is a placeholder for future rate limiting implementation
            }
            // Check if user has exceeded their tier limit
            // Note: Rate limiting is now handled by the @fastify/rate-limit plugin
            // This is a placeholder for future rate limiting implementation
        }
    });
    // Register auth routes
    await app.register(import('./routes.opaque.js').then(m => m.default), { prefix: '/api/v1/auth' });
    await app.register(import('./routes.me.js').then(m => m.default), { prefix: '/api/v1/auth' });
    logger.info({}, 'Authentication plugin registered');
});
//# sourceMappingURL=plugin.auth.js.map