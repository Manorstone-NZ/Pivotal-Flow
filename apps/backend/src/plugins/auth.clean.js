/**
 * Clean Authentication Plugin (No JWT)
 * Uses Opaque tokens for user sessions and PASETO v4.public for signed links
 */
import fp from 'fastify-plugin';
import { PasetoPublicService } from '../services/paseto-v4-public.js';
import { logger } from '../lib/logger.js';
/**
 * Extract token from Authorization header
 */
function extractToken(request) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
/**
 * Extract session ID from request (cookie or header)
 */
function extractSessionId(request) {
    // Try to get session ID from cookie first
    const sessionCookie = request.cookies?.['pf-session'];
    if (sessionCookie) {
        return sessionCookie;
    }
    // Fallback to Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}
/**
 * Clean Authentication Plugin
 */
async function authPlugin(fastify) {
    const pasetoService = new PasetoPublicService(fastify);
    // Public routes that don't require authentication
    const PUBLIC_ROUTES = [
        '/',
        '/health',
        '/api/v1/health',
        '/api/v1/health/ping',
        '/health/cache',
        '/metrics',
        '/docs',
        '/api/openapi.json',
        '/api/quotes-docs.json',
        '/api/quotes-openapi.json',
        '/api/docs',
        // Auth routes
        '/api/v1/auth/login-opaque',
        '/api/v1/auth/logout-opaque',
        '/api/v1/auth/service-token',
        '/api/v1/auth/verify-token',
        '/api/v1/auth/quote-delivery-token',
        // Public quote routes
        '/api/public/quotes/'
    ];
    /**
     * Check if route is public
     */
    function isPublicRoute(url) {
        return PUBLIC_ROUTES.some(route => url === route || url.startsWith(route));
    }
    /**
     * Verify opaque token (session-based)
     */
    async function verifyOpaqueToken(token) {
        try {
            // Check if token looks like an opaque session token
            if (!token.startsWith('session:')) {
                return null;
            }
            const sessionService = fastify.sessionService;
            if (!sessionService) {
                logger.warn('Session service not available for opaque token verification');
                return null;
            }
            const sessionData = await sessionService.validateUserSession(token);
            if (!sessionData) {
                return null;
            }
            return {
                userId: sessionData.userId,
                tenantId: sessionData.tenantId || '',
                permissions: sessionData.permissions || [],
                roles: sessionData.roles || [],
                tokenType: 'opaque'
            };
        }
        catch (error) {
            logger.error({ err: error }, 'Failed to verify opaque token');
            return null;
        }
    }
    /**
     * Verify PASETO v4.public token
     */
    async function verifyPasetoToken(token) {
        try {
            // Check if token looks like a PASETO v4.public token
            if (!token.startsWith('v4.public.')) {
                return null;
            }
            const payload = await pasetoService.verifyTokenReadOnly(token);
            return {
                userId: payload.sub,
                tenantId: payload.org,
                permissions: payload.scope,
                roles: [], // PASETO tokens contain permissions directly
                tokenType: 'paseto'
            };
        }
        catch (error) {
            logger.error({ err: error }, 'Failed to verify PASETO token');
            return null;
        }
    }
    // Authentication middleware
    fastify.addHook('preHandler', async (request, reply) => {
        const requestUrl = request.url;
        // Skip auth for public routes
        if (isPublicRoute(requestUrl)) {
            logger.debug({ requestUrl }, 'Skipping auth for public route');
            return;
        }
        // Extract token
        const token = extractToken(request);
        if (!token) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Authentication token required',
                code: 'TOKEN_REQUIRED'
            });
        }
        // Try to verify token (opaque first, then PASETO)
        let authContext = await verifyOpaqueToken(token);
        if (!authContext) {
            authContext = await verifyPasetoToken(token);
        }
        if (!authContext) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }
        // Attach auth context to request
        request.auth = authContext;
        logger.debug({
            userId: authContext.userId,
            tenantId: authContext.tenantId,
            tokenType: authContext.tokenType,
            permissionCount: authContext.permissions.length
        }, 'Authentication successful');
    });
    // Utility functions for route handlers
    fastify.decorate('requirePermission', (permission) => {
        return async (request, reply) => {
            if (!request.auth) {
                return reply.status(401).send({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }
            if (!request.auth.permissions.includes(permission)) {
                return reply.status(403).send({
                    error: 'Forbidden',
                    message: `Permission required: ${permission}`,
                    code: 'PERMISSION_DENIED'
                });
            }
        };
    });
    fastify.decorate('getTenantId', (request) => {
        return request.auth?.tenantId || null;
    });
    fastify.decorate('getUserId', (request) => {
        return request.auth?.userId || null;
    });
    // Authentication middleware for routes
    fastify.decorate('authenticate', async (request, reply) => {
        logger.info({ url: request.url, hasCache: !!fastify.cache }, 'Authenticate middleware called');
        // Check if route is public
        const isPublic = PUBLIC_ROUTES.some(route => {
            // Handle exact matches and path prefixes more carefully
            const url = request.url.split('?')[0]; // Remove query parameters
            let matches = false;
            if (route === '/') {
                // Only match exact root path
                matches = url === '/';
            }
            else {
                // For other routes, match if URL starts with route
                matches = url.startsWith(route);
            }
            if (matches) {
                logger.info({ url: request.url, matchingRoute: route, urlPath: url }, 'Route matches public route');
            }
            return matches;
        });
        if (isPublic) {
            logger.info({ url: request.url }, 'Public route, skipping authentication');
            return; // Allow public routes
        }
        // Try to authenticate with opaque tokens (session cookies)
        const sessionId = extractSessionId(request);
        logger.info({ sessionId: sessionId ? sessionId.substring(0, 10) + '...' : 'none' }, 'Extracted session ID');
        if (sessionId) {
            try {
                const cache = fastify.cache;
                const sessionData = await cache.get(`session:${sessionId}`);
                logger.info({ hasSessionData: !!sessionData, sessionDataLength: sessionData?.length }, 'Session data retrieved');
                if (sessionData) {
                    // Parse session data and set user context
                    const parsedSession = JSON.parse(sessionData);
                    request.user = {
                        id: parsedSession.userId,
                        userId: parsedSession.userId,
                        organizationId: parsedSession.tenantId,
                        tenantId: parsedSession.tenantId,
                        roles: parsedSession.roles || [],
                        permissions: parsedSession.permissions || []
                    };
                    logger.info({ userId: parsedSession.userId, tenantId: parsedSession.tenantId }, 'Authentication successful');
                    return; // Authentication successful
                }
            }
            catch (error) {
                logger.error({ error, sessionId: sessionId.substring(0, 10) + '...' }, 'Failed to validate session');
            }
        }
        // Try to authenticate with PASETO tokens
        const token = extractToken(request);
        if (token) {
            try {
                const payload = await pasetoService.verifyToken(token);
                if (payload) {
                    request.user = {
                        id: payload.sub,
                        userId: payload.sub,
                        organizationId: payload.org,
                        tenantId: payload.org,
                        roles: [],
                        permissions: payload.scope || []
                    };
                    return; // Authentication successful
                }
            }
            catch (error) {
                logger.error({ error, token: token.substring(0, 20) + '...' }, 'Failed to verify PASETO token');
            }
        }
        // Authentication failed
        return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    });
    logger.info('Clean authentication plugin registered (no JWT)');
}
export default fp(authPlugin, {
    name: 'auth-clean',
    dependencies: ['redis-auth']
});
//# sourceMappingURL=auth.clean.js.map