/**
 * Portal Rate Limiter
 *
 * Separate rate limiting for portal endpoints with customer isolation
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { PortalUserContext } from './types.js';
/**
 * Portal rate limiting middleware
 */
export declare function portalRateLimit(request: FastifyRequest, reply: FastifyReply): Promise<void>;
/**
 * Portal authentication middleware
 * Validates external customer user and sets portal user context
 */
export declare function portalAuth(request: FastifyRequest, reply: FastifyReply): Promise<void>;
/**
 * Get current rate limit status for a user (useful for debugging)
 */
export declare function getRateLimitStatus(userContext: PortalUserContext, endpoint: string): {
    current: number;
    limit: number;
    remaining: number;
    windowStart: number;
    resetTime: number;
};
//# sourceMappingURL=rate-limiter.d.ts.map