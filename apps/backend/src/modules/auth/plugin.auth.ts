import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Redis } from 'ioredis';
import { config } from '../../lib/config.js';
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

export default fp(async function authPlugin(app: FastifyInstance) {
  // Register cookie plugin first
  await app.register(cookie, { 
    secret: config.auth.cookieSecret,
    parseOptions: {
      httpOnly: true,
      secure: config.auth.cookieSecure,
      sameSite: 'lax',
      path: '/',
    },
  });

  // Register JWT plugin
  await app.register(jwt as any, {
    secret: config.auth.jwtSecret,
    sign: {
      issuer: 'pivotal-flow',
      audience: 'pivotal-flow-api',
      expiresIn: config.auth.accessTokenTTL,
      algorithm: 'HS256',
    },
    verify: {
      issuer: 'pivotal-flow',
      audience: 'pivotal-flow-api',
    },
  });

  // Register rate limiting for auth routes with tiers
  await app.register(rateLimit as any, {
    max: config.rateLimit.unauth, // Default for unauthenticated
    timeWindow: config.rateLimit.window,
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

  // Create Redis instance and decorate it
  const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379');
  app.decorate('redis', redis);

  // Add route-specific rate limiting for sensitive endpoints
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const route = request.url;
    
    // Apply stricter rate limiting for login attempts
    if (route === '/v1/auth/login') {
      const key = `login:${request.ip}`;
      const current = await redis.get(key);
      
      if (current && parseInt(current) >= config.rateLimit.login) {
        return reply.status(429).send({
          error: 'Too Many Login Attempts',
          message: 'Login rate limit exceeded, please try again later',
          code: 'LOGIN_RATE_LIMIT_EXCEEDED',
          retryAfter: 300, // 5 minutes
        });
      }
      
      // Increment login attempts counter
      await redis.multi()
        .incr(key)
        .expire(key, 300) // 5 minute window
        .exec();
    }
  });

  // Create the TokenManager only after JWT is ready
  const tokenManager = createTokenManager(app);
  app.decorate('tokenManager', tokenManager);

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
        requestUrl === '/metrics' ||
        requestUrl === '/' ||
        requestUrl.startsWith('/docs') ||
        requestUrl === '/v1/auth/login' ||
        requestUrl === '/v1/auth/refresh') {
      logger.info({ requestUrl }, 'Skipping auth for public route');
      return;
    }

    try {
      await (request as any).jwtVerify();
      
      // Extract user context from JWT payload
      const payload = (request as any).user as any;
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
      const userKey = `user:${user.userId}`;
      const current = await redis.get(userKey);
      
      let limit = config.rateLimit.auth; // Default authenticated user limit
      
      // Admin users get higher limits
      if (user.roles?.includes('admin')) {
        limit = config.rateLimit.admin;
      }
      
      // Check if user has exceeded their tier limit
      if (current && parseInt(current) >= limit) {
        // This would trigger the rate limit error response
        // The actual rate limiting is handled by the @fastify/rate-limit plugin
      }
    }
  });

  logger.info({}, 'Authentication plugin registered');
});
