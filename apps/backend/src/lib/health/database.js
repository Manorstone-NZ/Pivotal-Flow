import { createDbLogger } from '../logger.js';
import { getDatabaseHealth } from './utils.js';
export async function checkDatabaseHealth(fastify) {
    const startTime = Date.now();
    const dbLogger = createDbLogger('health_check');
    try {
        dbLogger.debug('Starting database health check');
        // Use Drizzle database for health check
        const healthResult = await getDatabaseHealth(fastify);
        const latency = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        dbLogger.info({
            message: 'Database health check completed',
            latency,
            healthStatus: healthResult.status,
        });
        return {
            status: healthResult.status,
            message: healthResult.message,
            latency,
            timestamp,
        };
    }
    catch (error) {
        const latency = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        dbLogger.error({
            message: 'Database health check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            latency,
        });
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Database health check failed',
            latency,
            timestamp,
        };
    }
}
//# sourceMappingURL=database.js.map