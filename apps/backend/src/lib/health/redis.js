import { createRedisLogger } from '../logger.js';
import { getRedisHealth } from './utils.js';
export async function checkRedisHealth() {
    const startTime = Date.now();
    const redisLogger = createRedisLogger('health_check');
    try {
        redisLogger.debug('Starting Redis health check');
        // Use the shared Redis client for health check
        const healthResult = await getRedisHealth();
        const latency = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        redisLogger.info({
            message: 'Redis health check completed',
            latency,
            healthStatus: healthResult.status,
        });
        return {
            status: healthResult.status,
            message: healthResult.message,
            timestamp,
            latency,
        };
    }
    catch (error) {
        const latency = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        redisLogger.error({
            message: 'Redis health check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            latency,
        });
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Redis health check failed',
            latency,
            timestamp,
        };
    }
}
//# sourceMappingURL=redis.js.map