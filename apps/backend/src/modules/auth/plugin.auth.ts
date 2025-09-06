import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { TokenManager } from '@pivotal-flow/shared';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

import { config } from '../../config/index.js';
import { logger } from '../../lib/logger.js';


import { createTokenManager } from './tokens.js';

// Type definitions for request context
interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  roles: string[];
  jti: string;
}

// Use type assertion for authenticated requests
type AuthenticatedRequest = FastifyRequest & {
  user: AuthenticatedUser;
};

interface RateLimitContext {
  limit: number;
  current: number;
  window: number;
  after: number;
}

/**
 * Parse TTL string to seconds
 */
function parseTTL(ttl: string): number {
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

export default fp(async function authPlugin(app: FastifyInstance) {
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

  // Register JWT plugin
  await app.register(jwt as any, {
    secret: config.auth.JWT_SECRET,
    sign: {
      issuer: 'pivotal-flow',
      audience: 'pivotal-flow-api',
      expiresIn: config.auth.ACCESS_TOKEN_TTL,
      algorithm: 'HS256',
    },
    verify: {
      issuer: 'pivotal-flow',
      audience: 'pivotal-flow-api',
    },
  });

  // Register rate limiting for auth routes with tiers
  await app.register(rateLimit as any, {
    max: config.rateLimit.RATE_LIMIT_UNAUTH_MAX, // Default for unauthenticated
    timeWindow: config.rateLimit.RATE_LIMIT_WINDOW,
    keyGenerator: (request: AuthenticatedRequest) => {
      // Use IP for unauthenticated routes, user ID for authenticated
      const user = request.user;
      return user?.userId ?? request.ip;
    },
    errorResponseBuilder: (_request: AuthenticatedRequest, context: RateLimitContext) => {
      const retryAfter = Math.ceil(Number(context.after) / 1000);
      return {
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${retryAfter} seconds`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
      };
    },
    // Custom rate limiting logic
    onExceeded: (request: AuthenticatedRequest, context: RateLimitContext) => {
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
  app.addHook('onRequest', async (request: FastifyRequest) => {
    const route = request.url;
    
    // Apply stricter rate limiting for login attempts
    if (route === '/v1/auth/login') {
      // Note: Rate limiting is now handled by the cache plugin
      // This is a placeholder for future rate limiting implementation
    }
  });

  // Create the TokenManager only after JWT is ready
  const tokenManager = createTokenManager(app);
  
  // Create Redis-based TokenManager for refresh token storage
  const cacheAdapter = {
    get: (key: string) => Promise.resolve((app as any).cache.get(key)),
    set: (key: string, value: string, _mode?: string, ttl?: number) => Promise.resolve((app as any).cache.set(key, value, ttl)),
    del: (key: string) => Promise.resolve((app as any).cache.delete(key))
  };
  
  const refreshTokenManager = new TokenManager(
    cacheAdapter,
    parseTTL(config.auth.REFRESH_TOKEN_TTL)
  );
  
  app.decorate('tokenManager', tokenManager);
  app.decorate('refreshTokenManager', refreshTokenManager);

  // Add JWT verification preHandler
  app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
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
        requestUrl === '/health/cache' ||
        requestUrl === '/metrics' ||
        requestUrl === '/' ||
        requestUrl.startsWith('/docs') ||
        requestUrl === '/v1/auth/login' ||
        requestUrl === '/v1/auth/refresh' ||
        requestUrl.startsWith('/v1/test/')) {
      logger.info({ requestUrl }, 'Skipping auth for public route');
      return;
    }

    try {
      await (request as any).jwtVerify();
      
      // Extract user context from JWT payload
      const payload = (request as any).user;
      (request as any).user = {
        userId: payload.sub,
        organizationId: payload.org,
        roles: payload.roles ?? [],
        jti: payload.jti,
      };
    } catch (err) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      });
    }
  });

  // Add postHandler to apply different rate limits based on authentication
  app.addHook('onResponse', async (request: FastifyRequest) => {
    const user = (request as any).user;
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

  logger.info({}, 'Authentication plugin registered');
});
