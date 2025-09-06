/**
 * CORS and Rate Limiting Configuration for C0 Backend Readiness
 * Environment-specific policies and per-route rate limits
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

import { config } from './config.js';

// Environment-specific CORS configuration
export const CORS_CONFIG = {
  development: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'Idempotency-Key',
      'X-Organization-ID',
      'X-CSRF-Token'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Organization-ID',
      'X-CSRF-Token',
      'X-API-Version'
    ]
  },
  staging: {
    origin: [
      'https://staging.pivotalflow.com',
      'https://staging-admin.pivotalflow.com',
      'https://staging-portal.pivotalflow.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'Idempotency-Key',
      'X-Organization-ID',
      'X-CSRF-Token'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Organization-ID',
      'X-CSRF-Token',
      'X-API-Version'
    ]
  },
  production: {
    origin: [
      'https://app.pivotalflow.com',
      'https://admin.pivotalflow.com',
      'https://portal.pivotalflow.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'Idempotency-Key',
      'X-Organization-ID',
      'X-CSRF-Token'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Organization-ID',
      'X-CSRF-Token',
      'X-API-Version'
    ]
  }
};

// Rate limiting configuration per route
export const RATE_LIMIT_CONFIG = {
  // Default rate limits
  default: {
    max: 1000, // requests per window
    timeWindow: '1 minute',
    allowList: ['127.0.0.1', '::1'] as string[], // localhost
    keyGenerator: (request: FastifyRequest) => {
      // Use user ID if authenticated, otherwise IP
      return (request as unknown as { user?: { sub?: string } }).user?.sub || request.ip;
    }
  },
  
  // Portal endpoints (customer-facing) - stricter limits
  portal: {
    max: 200, // requests per window
    timeWindow: '1 minute',
    allowList: [] as string[], // No allowlist for portal
    keyGenerator: (request: FastifyRequest) => {
      // Use customer ID for portal users
      return (request as unknown as { user?: { customerId?: string } }).user?.customerId || request.ip;
    }
  },
  
  // Authentication endpoints - moderate limits
  auth: {
    max: 10, // login attempts per window
    timeWindow: '5 minutes',
    allowList: [] as string[], // No allowlist for auth
    keyGenerator: (request: FastifyRequest) => {
      // Use IP for auth endpoints
      return request.ip;
    }
  },
  
  // Export endpoints - lower limits due to resource intensity
  export: {
    max: 5, // export requests per window
    timeWindow: '1 hour',
    allowList: [] as string[], // No allowlist for export
    keyGenerator: (request: FastifyRequest) => {
      // Use user ID for export endpoints
      return (request as unknown as { user?: { sub?: string } }).user?.sub || request.ip;
    }
  },
  
  // Report endpoints - moderate limits
  reports: {
    max: 50, // report requests per window
    timeWindow: '1 minute',
    allowList: [] as string[], // No allowlist for reports
    keyGenerator: (request: FastifyRequest) => {
      // Use user ID for report endpoints
      return (request as unknown as { user?: { sub?: string } }).user?.sub || request.ip;
    }
  },
  
  // Health and metrics - no limits
  health: {
    max: 0, // no limit
    timeWindow: '1 minute',
    allowList: [] as string[], // No allowlist for health
    keyGenerator: (request: FastifyRequest) => request.ip
  }
};

// Route-specific rate limit mapping
export const ROUTE_RATE_LIMITS = {
  // Portal routes
  '/portal': 'portal',
  '/portal/quotes': 'portal',
  '/portal/invoices': 'portal',
  '/portal/time': 'portal',
  
  // Authentication routes
  '/auth/login': 'auth',
  '/auth/refresh': 'auth',
  '/auth/logout': 'auth',
  '/auth/mfa': 'auth',
  
  // Export routes
  '/reports/export': 'export',
  '/reports/export/': 'export',
  
  // Report routes
  '/reports/summary': 'reports',
  '/reports/': 'reports',
  
  // Health and metrics
  '/health': 'health',
  '/metrics': 'health',
  '/docs': 'health',
  '/docs/json': 'health',
  '/api/openapi.json': 'health'
};

/**
 * Get CORS configuration for current environment
 */
export function getCorsConfig() {
  const env = config.env || 'development';
  
  // Use CORS_ORIGIN environment variable if provided (comma-separated)
  const corsOriginEnv = process.env['CORS_ORIGIN'];
  if (corsOriginEnv) {
    const origins = corsOriginEnv.split(',').map(origin => origin.trim());
    return {
      origin: origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-ID',
        'Idempotency-Key',
        'X-Organization-ID',
      'X-CSRF-Token',
        'X-Organization-ID',
      'X-CSRF-Token'
      ],
      exposedHeaders: [
        'X-Request-ID',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Organization-ID',
      'X-CSRF-Token',
        'X-API-Version'
      ]
    };
  }
  
  return CORS_CONFIG[env as keyof typeof CORS_CONFIG] || CORS_CONFIG.development;
}

/**
 * Get rate limit configuration for a route
 */
export function getRateLimitConfig(route: string): typeof RATE_LIMIT_CONFIG[keyof typeof RATE_LIMIT_CONFIG] {
  // Find matching route pattern
  for (const [pattern, configKey] of Object.entries(ROUTE_RATE_LIMITS)) {
    if (route.startsWith(pattern)) {
      return RATE_LIMIT_CONFIG[configKey as keyof typeof RATE_LIMIT_CONFIG];
    }
  }
  
  // Return default configuration
  return RATE_LIMIT_CONFIG.default;
}

/**
 * Create rate limit configuration for Fastify
 */
export function createRateLimitConfig(route: string) {
  const config = getRateLimitConfig(route);
  
  return {
    max: config.max,
    timeWindow: config.timeWindow,
    allowList: config.allowList,
    keyGenerator: config.keyGenerator,
    errorResponseBuilder: (request: FastifyRequest, context: { max: number; remaining: number; resetTime: number }) => ({
      error: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Rate limit exceeded',
        details: {
          limit: context.max,
          remaining: context.remaining,
          reset: context.resetTime
        },
        timestamp: new Date().toISOString(),
        request_id: request.id
      },
      meta: {
        api_version: '1.0.0',
        documentation_url: 'https://api.pivotalflow.com/docs'
      }
    }),
    onExceeded: (_request: FastifyRequest, _reply: FastifyReply) => {
      // Rate limit exceeded - logging removed for type safety
    }
  };
}

/**
 * Rate limit headers middleware
 */
export function rateLimitHeadersMiddleware(_request: FastifyRequest, reply: FastifyReply, done: () => void) {
  // Add rate limit headers to all responses
  const rateLimitConfig = getRateLimitConfig(_request.url);
  
  // These headers will be set by the rate limit plugin
  // We just ensure they're exposed in CORS
  reply.header('X-RateLimit-Limit', rateLimitConfig.max);
  
  done();
}

/**
 * Security headers middleware
 */
export function securityHeadersMiddleware(_request: FastifyRequest, reply: FastifyReply, done: () => void) {
  // Add security headers
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add API version header
  reply.header('X-API-Version', '1.0.0');
  
  done();
}

/**
 * CORS preflight handler
 */
export function corsPreflightHandler(request: FastifyRequest, reply: FastifyReply) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    reply.status(200).send();
    return;
  }
}

/**
 * Environment-specific configuration validation
 */
export function validateEnvironmentConfig() {
  const env = config.env || 'development';
  const corsConfig = getCorsConfig();
  
  console.log(`CORS Configuration for ${env}:`, {
    origins: corsConfig.origin,
    methods: corsConfig.methods,
    allowedHeaders: corsConfig.allowedHeaders,
    exposedHeaders: corsConfig.exposedHeaders
  });
  
  console.log('Rate Limit Configuration:', {
    default: RATE_LIMIT_CONFIG.default,
    portal: RATE_LIMIT_CONFIG.portal,
    auth: RATE_LIMIT_CONFIG.auth,
    export: RATE_LIMIT_CONFIG.export,
    reports: RATE_LIMIT_CONFIG.reports
  });
}
