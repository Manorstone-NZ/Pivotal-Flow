/**
 * Portal Rate Limiter
 * 
 * Separate rate limiting for portal endpoints with customer isolation
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { PortalUserContext, PortalRateLimitContext } from './types.js';
import { PORTAL_RATE_LIMITS } from './constants.js';

// In-memory rate limit store (replace with Redis in production)
const rateLimitStore = new Map<string, PortalRateLimitContext>();

/**
 * Generate rate limit key for customer isolation
 */
function getRateLimitKey(userContext: PortalUserContext, endpoint: string): string {
  return `portal:${userContext.organizationId}:${userContext.customerId}:${userContext.userId}:${endpoint}`;
}

/**
 * Clean expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, context] of rateLimitStore.entries()) {
    if (now - context.windowStart > PORTAL_RATE_LIMITS.WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check and update rate limit for portal request
 */
function checkRateLimit(userContext: PortalUserContext, endpoint: string): {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  resetTime: number;
  windowStart: number;
} {
  const now = Date.now();
  const key = getRateLimitKey(userContext, endpoint);
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupExpiredEntries();
  }
  
  let context = rateLimitStore.get(key);
  
  // Initialize or reset window if expired
  if (!context || (now - context.windowStart) >= PORTAL_RATE_LIMITS.WINDOW_MS) {
    context = {
      userId: userContext.userId,
      organizationId: userContext.organizationId,
      customerId: userContext.customerId,
      endpoint,
      windowStart: now,
      requestCount: 0,
      limit: PORTAL_RATE_LIMITS.DEFAULT_RPM
    };
  }
  
  // Increment request count
  context.requestCount++;
  
  // Update store
  rateLimitStore.set(key, context);
  
  const resetTime = context.windowStart + PORTAL_RATE_LIMITS.WINDOW_MS;
  const remaining = Math.max(0, context.limit - context.requestCount);
  const allowed = context.requestCount <= context.limit;
  
  return {
    allowed,
    current: context.requestCount,
    limit: context.limit,
    remaining,
    resetTime,
    windowStart: context.windowStart
  };
}

/**
 * Portal rate limiting middleware
 */
export async function portalRateLimit(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Extract user context from authenticated request
  const userContext = (request as any).portalUser as PortalUserContext;
  
  if (!userContext) {
    reply.status(401).send({
      error: 'Unauthorized',
      message: 'Portal authentication required'
    });
    return;
  }
  
  // Get endpoint path for rate limiting granularity
  const endpoint = request.routeConfig?.method + ' ' + request.routeConfig?.url || 'unknown';
  
  // Check rate limit
  const result = checkRateLimit(userContext, endpoint);
  
  // Set rate limit headers
  reply.headers({
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    'X-RateLimit-Window': (PORTAL_RATE_LIMITS.WINDOW_MS / 1000).toString()
  });
  
  // Check if rate limit exceeded
  if (!result.allowed) {
    // TODO: Increment rate limit hit metrics
    
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    
    reply
      .status(429)
      .header('Retry-After', retryAfter.toString())
      .send({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        code: 'RATE_LIMIT_EXCEEDED',
        details: {
          limit: result.limit,
          window: PORTAL_RATE_LIMITS.WINDOW_MS / 1000,
          retryAfter
        }
      });
    return;
  }
}

/**
 * Portal authentication middleware
 * Validates external customer user and sets portal user context
 */
export async function portalAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // This assumes standard JWT authentication has already run
  const user = (request as any).user;
  
  if (!user) {
    reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
    return;
  }
  
  // Validate user is external customer type with customer ID
  if (user.userType !== 'external_customer' || !user.customerId) {
    reply.status(403).send({
      error: 'Forbidden',
      message: 'Portal access is only available to external customer users'
    });
    return;
  }
  
  // Set portal user context for downstream handlers
  const portalUser: PortalUserContext = {
    userId: user.userId,
    organizationId: user.organizationId,
    customerId: user.customerId,
    userType: user.userType,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };
  
  (request as any).portalUser = portalUser;
}

/**
 * Get current rate limit status for a user (useful for debugging)
 */
export function getRateLimitStatus(userContext: PortalUserContext, endpoint: string) {
  const key = getRateLimitKey(userContext, endpoint);
  const context = rateLimitStore.get(key);
  
  if (!context) {
    return {
      current: 0,
      limit: PORTAL_RATE_LIMITS.DEFAULT_RPM,
      remaining: PORTAL_RATE_LIMITS.DEFAULT_RPM,
      windowStart: Date.now(),
      resetTime: Date.now() + PORTAL_RATE_LIMITS.WINDOW_MS
    };
  }
  
  // const now = Date.now(); // Available for future use
  const resetTime = context.windowStart + PORTAL_RATE_LIMITS.WINDOW_MS;
  const remaining = Math.max(0, context.limit - context.requestCount);
  
  return {
    current: context.requestCount,
    limit: context.limit,
    remaining,
    windowStart: context.windowStart,
    resetTime
  };
}
