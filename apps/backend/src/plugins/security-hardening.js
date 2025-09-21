/**
 * F1.5 Security Hardening Plugin
 * Implements comprehensive security measures including rate limiting,
 * security headers, and endpoint protection
 */
import rateLimit from '@fastify/rate-limit';
import { logger } from '../lib/logger.js';
const securityConfig = {
    rateLimit: {
        auth: {
            max: 10, // 10 attempts per window
            timeWindow: '15 minutes'
        },
        public: {
            max: 50, // 50 requests per window for public endpoints
            timeWindow: '15 minutes'
        },
        api: {
            max: 1000, // 1000 requests per window for authenticated API
            timeWindow: '15 minutes'
        }
    },
    headers: {
        csp: {
            directives: {
                'default-src': ["'self'"],
                'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // TODO: Remove unsafe-* in production
                'style-src': ["'self'", "'unsafe-inline'"],
                'img-src': ["'self'", 'data:', 'https:'],
                'font-src': ["'self'", 'https:', 'data:'],
                'connect-src': ["'self'"],
                'frame-ancestors': ["'none'"], // F1.5 requirement
                'base-uri': ["'self'"],
                'form-action': ["'self'"]
            }
        },
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
        }
    }
};
export const securityHardeningPlugin = async (fastify) => {
    // ===== RATE LIMITING =====
    // Single rate limiting configuration with dynamic limits based on route
    await fastify.register(rateLimit, {
        max: (request) => {
            // Dynamic limits based on route
            if (request.url.includes('/auth/')) {
                return securityConfig.rateLimit.auth.max;
            }
            if (request.url.includes('/public/')) {
                return securityConfig.rateLimit.public.max;
            }
            return securityConfig.rateLimit.api.max;
        },
        timeWindow: '15 minutes',
        keyGenerator: (request) => {
            // Intelligent key generation based on route type
            if (request.url.includes('/auth/')) {
                const ip = request.ip;
                const userAgent = request.headers['user-agent'] || 'unknown';
                return `auth:${ip}:${Buffer.from(userAgent).toString('base64').substring(0, 20)}`;
            }
            if (request.url.includes('/public/')) {
                return `public:${request.ip}`;
            }
            // API routes - use user ID if authenticated
            const user = request.user;
            if (user?.id) {
                return `api:user:${user.id}`;
            }
            return `api:ip:${request.ip}`;
        },
        errorResponseBuilder: (request, context) => {
            const routeType = request.url.includes('/auth/') ? 'authentication' :
                request.url.includes('/public/') ? 'public API' : 'API';
            logger.warn({
                ip: request.ip,
                userAgent: request.headers['user-agent'],
                url: request.url,
                routeType,
                limit: context.max,
                remaining: context.remaining
            }, 'Rate limit exceeded');
            return {
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: `Too many ${routeType} requests. Please try again later.`,
                    details: {
                        limit: context.max,
                        remaining: context.remaining,
                        resetTime: new Date(Date.now() + context.ttl).toISOString()
                    }
                }
            };
        },
        skipOnError: false,
        skipSuccessfulRequests: false
    });
    // ===== SECURITY HEADERS =====
    fastify.addHook('onSend', async (request, reply, payload) => {
        // F1.5 Security Headers
        // Content Security Policy with nonces (F1.5 requirement)
        const nonce = generateNonce();
        const cspDirectives = Object.entries(securityConfig.headers.csp.directives)
            .map(([directive, sources]) => {
            if (directive === 'script-src' || directive === 'style-src') {
                return `${directive} ${sources.join(' ')} 'nonce-${nonce}'`;
            }
            return `${directive} ${sources.join(' ')}`;
        })
            .join('; ');
        reply.header('Content-Security-Policy', cspDirectives);
        // F1.5 Required Security Headers
        reply.header('X-Frame-Options', 'DENY'); // frame-ancestors 'none' equivalent
        reply.header('X-Content-Type-Options', 'nosniff');
        reply.header('Referrer-Policy', 'no-referrer');
        reply.header('X-XSS-Protection', '1; mode=block');
        // Permissions Policy (F1.5 requirement - minimal permissions)
        reply.header('Permissions-Policy', [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'payment=()',
            'usb=()',
            'bluetooth=()',
            'magnetometer=()',
            'accelerometer=()',
            'gyroscope=()'
        ].join(', '));
        // HSTS for HTTPS connections
        if (request.headers['x-forwarded-proto'] === 'https' || request.protocol === 'https') {
            const hstsValue = `max-age=${securityConfig.headers.hsts.maxAge}` +
                (securityConfig.headers.hsts.includeSubDomains ? '; includeSubDomains' : '') +
                (securityConfig.headers.hsts.preload ? '; preload' : '');
            reply.header('Strict-Transport-Security', hstsValue);
        }
        // Remove server information disclosure
        reply.removeHeader('Server');
        reply.removeHeader('X-Powered-By');
        // Add security-focused cache control for sensitive endpoints
        if (request.url.includes('/auth/') || request.url.includes('/admin/')) {
            reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            reply.header('Pragma', 'no-cache');
            reply.header('Expires', '0');
        }
        return payload;
    });
    // ===== SECURITY MONITORING =====
    // Log suspicious activity
    fastify.addHook('onRequest', async (request) => {
        // Log potential security issues
        const suspiciousPatterns = [
            /\.\./, // Path traversal
            /<script/i, // XSS attempts
            /union.*select/i, // SQL injection
            /javascript:/i, // JavaScript protocol
            /data:.*base64/i // Data URLs with base64
        ];
        const url = request.url.toLowerCase();
        const userAgent = request.headers['user-agent']?.toLowerCase() || '';
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(url) || pattern.test(userAgent)) {
                logger.warn({
                    ip: request.ip,
                    userAgent: request.headers['user-agent'],
                    url: request.url,
                    method: request.method,
                    suspiciousPattern: pattern.toString()
                }, 'Suspicious request detected');
                break;
            }
        }
    });
    // ===== CSRF PROTECTION =====
    // For stateful operations, implement double-submit cookie pattern
    fastify.addHook('preHandler', async (request, reply) => {
        // Skip CSRF for GET, HEAD, OPTIONS
        if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
            return;
        }
        // Skip CSRF for Bearer token auth (F1.5 uses PASETO tokens)
        const authHeader = request.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            return; // PASETO tokens provide CSRF protection
        }
        // For cookie-based auth, implement CSRF protection
        const csrfToken = request.headers['x-csrf-token'];
        const csrfCookie = request.cookies?.['csrf-token'];
        if (csrfCookie && (!csrfToken || csrfToken !== csrfCookie)) {
            logger.warn({
                ip: request.ip,
                url: request.url,
                method: request.method
            }, 'CSRF token mismatch');
            return reply.status(403).send({
                error: {
                    code: 'CSRF_TOKEN_INVALID',
                    message: 'CSRF token validation failed'
                }
            });
        }
    });
    logger.info('F1.5 Security hardening plugin loaded successfully');
};
// Helper function to generate CSP nonces
function generateNonce() {
    return Buffer.from(Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15))
        .toString('base64')
        .substring(0, 16);
}
export default securityHardeningPlugin;
//# sourceMappingURL=security-hardening.js.map