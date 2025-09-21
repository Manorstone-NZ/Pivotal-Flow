/**
 * Opaque Authentication Plugin
 * Implements opaque session tokens with Redis storage
 * Only registers when AUTH_USE_OPAQUE=true
 */
import fp from 'fastify-plugin';
import { SessionService, PasetoKeyManager } from '../services/paseto.js';
import { AuthRepository } from '../repositories/auth.js';
import { AuthenticationError, AuthorizationError } from '../lib/error-handler.js';
import { logger } from '../lib/logger.js';
// Routes that require opaque session validation (exclude login routes)
const OPAQUE_PROTECTED_ROUTES = [
    '/api/v1/auth/logout-opaque',
    '/api/v1/auth/sessions'
];
// Routes that are public for opaque auth (don't require session)
const OPAQUE_PUBLIC_ROUTES = [
    '/api/v1/auth/login-opaque'
];
/**
 * Check if route should use opaque authentication
 */
function shouldUseOpaqueAuth(url) {
    return OPAQUE_PROTECTED_ROUTES.some(route => url.startsWith(route));
}
/**
 * Check if route is public for opaque auth
 */
function isOpaquePublicRoute(url) {
    return OPAQUE_PUBLIC_ROUTES.some(route => url.startsWith(route));
}
/**
 * Extract session ID from cookie or header
 */
function extractSessionId(request) {
    // Try cookie first (HttpOnly, SameSite)
    const cookieSid = request.cookies?.['pf-session'];
    if (cookieSid) {
        return cookieSid;
    }
    // Fallback to Authorization header for API clients
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Check if it's an opaque session ID (not JWT)
        if (token.startsWith('session:') && !token.includes('.')) {
            return token;
        }
    }
    return null;
}
/**
 * Opaque Authentication Plugin
 */
export const opaqueAuthPlugin = fp(async (fastify) => {
    // Initialize services
    const keyManager = new PasetoKeyManager();
    const sessionService = new SessionService(fastify, keyManager);
    const authRepository = new AuthRepository(fastify);
    // Decorate fastify instance
    fastify.decorate('sessionService', sessionService);
    fastify.decorate('authRepository', authRepository);
    // Session validation middleware
    fastify.addHook('preHandler', async (request, reply) => {
        // Skip public opaque routes (like login)
        if (isOpaquePublicRoute(request.url)) {
            return;
        }
        // Only apply to opaque protected routes when flag is enabled
        if (!shouldUseOpaqueAuth(request.url)) {
            return;
        }
        const sessionId = extractSessionId(request);
        if (!sessionId) {
            throw new AuthenticationError('Session required');
        }
        // Validate session with binding
        const sessionData = await sessionService.validateUserSession(sessionId, {
            ipAddress: request.ip,
            userAgent: request.headers['user-agent']
        }, {
            slidingExpiry: true,
            bindToIp: process.env.SESSION_BIND_IP === 'true',
            bindToUserAgent: process.env.SESSION_BIND_UA === 'true'
        });
        if (!sessionData) {
            throw new AuthenticationError('Invalid or expired session');
        }
        // Attach session context to request
        request.opaqueSession = sessionData;
        request.sessionId = sessionId;
        logger.debug({
            sessionId: sessionId.substring(0, 12) + '...',
            userId: sessionData.userId,
            tenantId: sessionData.tenantId
        }, 'Opaque session validated');
    });
    logger.info('Opaque authentication plugin registered (AUTH_USE_OPAQUE=true)');
}, {
    name: 'opaque-auth',
    dependencies: ['redis-auth']
});
//# sourceMappingURL=auth.opaque.js.map