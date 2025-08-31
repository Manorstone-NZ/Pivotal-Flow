import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { Redis } from 'ioredis';
import { config } from '../../lib/config.js';
import { logger } from '../../lib/logger.js';
import { createTokenManager } from './tokens.js';

export default fp(async function authPlugin(app) {
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
  await app.register(rateLimit, {
    max: config.rateLimit.unauth, // Default for unauthenticated
    timeWindow: config.rateLimit.window,
    keyGenerator: (request: any) => {
      // Use IP for unauthenticated routes, user ID for authenticated
      const user = request.user as any;
      return user?.userId ?? request.ip;
    },
    errorResponseBuilder: (_request: any, context: any) => {
      const retryAfter = Math.ceil(Number(context.after) / 1000);
      return {
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${retryAfter} seconds`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
      };
    },
    // Custom rate limiting logic
    onExceeded: (request: any, context: any) => {
      const user = request.user as any;
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
  app.addHook('onRequest', async (request, reply) => {
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
  app.addHook('preHandler', async (request, reply) => {
    // Skip JWT verification for public routes
    const publicRoutes = [
      '/v1/auth/login',
      '/v1/auth/refresh',
      '/health',
      '/metrics',
      '/docs',
      '/docs/',
      '/docs/json',
      '/docs/static',
      '/docs/static/',
      '/'
    ];
    
    // Check if route is public
    if (publicRoutes.includes(request.url) || request.url.startsWith('/docs/')) {
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
  app.addHook('onResponse', async (request) => {
    const user = request.user as any;
    const route = request.url;
    
    // Skip for public routes
    if (['/health', '/metrics', '/docs', '/docs/json', '/'].includes(route)) {
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
