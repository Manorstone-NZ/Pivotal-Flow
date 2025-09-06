import type { FastifyInstance } from 'fastify';
/**
 * Get database connection info for health checks
 */
export declare function getDatabaseHealth(_fastify: FastifyInstance): Promise<{
    status: 'ok' | 'error';
    message: string;
    timestamp: string;
    latency: number;
}>;
/**
 * Get Redis connection info for health checks
 */
export declare function getRedisHealth(): Promise<{
    status: 'ok' | 'error';
    message: string;
    timestamp: string;
    latency: number;
}>;
//# sourceMappingURL=utils.d.ts.map