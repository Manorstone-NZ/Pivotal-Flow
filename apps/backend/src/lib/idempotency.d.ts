/**
 * Idempotency Service for C0 Backend Readiness
 * Supports Idempotency-Key header on create and update routes
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
export interface IdempotencyConfig {
    ttlHours: number;
    maxKeyLength: number;
    enabled: boolean;
}
/**
 * Idempotency Service
 */
export declare class IdempotencyService {
    private config;
    private cache;
    constructor(config?: Partial<IdempotencyConfig>);
    /**
     * Generate request hash for idempotency
     */
    private generateRequestHash;
    /**
     * Check if idempotency key exists and return cached response
     */
    checkIdempotency(idempotencyKey: string, organizationId: string, _userId: string, method: string, route: string, body: unknown, query?: Record<string, unknown>, params?: Record<string, unknown>): Promise<{
        exists: boolean;
        isDuplicate: boolean;
        response?: unknown;
        statusCode?: number;
        responseStatus?: number;
        responseBody?: unknown;
    }>;
    /**
     * Store idempotency record with response
     */
    storeIdempotency(idempotencyKey: string, organizationId: string, _userId: string, method: string, route: string, body: unknown, query: Record<string, unknown> | undefined, params: Record<string, unknown> | undefined, response: unknown, statusCode: number): Promise<void>;
    /**
     * Store response for idempotency (simplified interface)
     */
    storeResponse(context: {
        organizationId: string;
        userId: string;
        route: string;
        requestHash: string;
    }, statusCode: number, responseBody: unknown): Promise<void>;
    /**
     * Clean up expired idempotency records
     */
    cleanupExpiredRecords(): Promise<number>;
    /**
     * Get idempotency statistics
     */
    getStats(_organizationId: string): Promise<{
        totalRecords: number;
        expiredRecords: number;
        activeRecords: number;
    }>;
}
/**
 * Idempotency middleware for Fastify
 */
export declare function createIdempotencyMiddleware(config?: Partial<IdempotencyConfig>): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
/**
 * Idempotency key validation schema
 */
export declare const IdempotencyKeySchema: {
    type: string;
    properties: {
        'idempotency-key': {
            type: string;
            minLength: number;
            maxLength: number;
            description: string;
        };
    };
};
/**
 * Routes that support idempotency
 */
export declare const IDEMPOTENCY_ENABLED_ROUTES: string[];
/**
 * Check if route supports idempotency
 */
export declare function isIdempotencyEnabled(method: string, route: string): boolean;
//# sourceMappingURL=idempotency.d.ts.map