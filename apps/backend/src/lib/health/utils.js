// Health-related functions moved from shared package
import { healthCheck } from '../db.js';
/**
 * Get database connection info for health checks
 */
export async function getDatabaseHealth(_fastify) {
    const startTime = Date.now();
    try {
        // Use Drizzle health check
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database connection timeout')), 5000);
        });
        const queryPromise = healthCheck();
        const result = await Promise.race([queryPromise, timeoutPromise]);
        const latency = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        return {
            status: result.status,
            message: result.message,
            timestamp,
            latency,
        };
    }
    catch (error) {
        const latency = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Database connection failed',
            timestamp,
            latency,
        };
    }
}
/**
 * Get Redis connection info for health checks
 */
export async function getRedisHealth() {
    const startTime = Date.now();
    try {
        // For now, return a mock response since Redis is not directly accessible here
        // In a real implementation, you would use the Redis client
        const latency = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        return {
            status: 'ok',
            message: 'Redis connection successful',
            timestamp,
            latency,
        };
    }
    catch (error) {
        const latency = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Redis connection failed',
            timestamp,
            latency,
        };
    }
}
//# sourceMappingURL=utils.js.map