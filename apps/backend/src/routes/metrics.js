import { register } from 'prom-client';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';
// Default metrics are already collected in main index.ts
export async function metricsRoutes(fastify) {
    // Metrics endpoint
    fastify.get('/', async (request, reply) => {
        const requestId = request.requestId ?? 'unknown';
        const requestLogger = logger.child({ requestId, route: '/metrics' });
        try {
            // Check if metrics are enabled
            if (!config.metrics.METRICS_ENABLED) {
                requestLogger.warn('Metrics endpoint accessed but metrics are disabled');
                return reply.status(404).send('Metrics endpoint disabled');
            }
            requestLogger.debug('Metrics requested');
            // Get metrics in Prometheus format
            const metrics = await register.metrics();
            // Set appropriate headers for Prometheus
            reply.header('Content-Type', register.contentType);
            void requestLogger.info({
                message: 'Metrics served successfully',
                contentType: register.contentType,
            });
            return reply.status(200).send(metrics);
        }
        catch (error) {
            requestLogger.error({
                message: 'Failed to serve metrics',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return reply.status(500).send('Failed to generate metrics');
        }
    });
    // Metrics info endpoint
    fastify.get('/info', async (request, reply) => {
        const requestId = request.requestId ?? 'unknown';
        const requestLogger = logger.child({ requestId, route: '/metrics/info' });
        try {
            requestLogger.debug('Metrics info requested');
            const info = {
                enabled: config.metrics.METRICS_ENABLED,
                path: config.metrics.METRICS_PATH,
                defaultMetrics: true,
                customMetrics: [
                    'pivotal_cache_hits_total',
                    'pivotal_cache_miss_total',
                    'pivotal_cache_hit_rate_percentage',
                    'pivotal_repo_operation_duration_histogram'
                ],
            };
            requestLogger.info({
                message: 'Metrics info served successfully',
                info,
            });
            return reply.status(200).send(info);
        }
        catch (error) {
            requestLogger.error({
                message: 'Failed to serve metrics info',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return reply.status(500).send('Failed to get metrics info');
        }
    });
    // Health check endpoint for metrics
    fastify.get('/health', async (request, reply) => {
        const requestId = request.requestId ?? 'unknown';
        const requestLogger = logger.child({ requestId, route: '/metrics/health' });
        try {
            requestLogger.debug('Metrics health check requested');
            // Check if metrics registry is working
            const metrics = await register.metrics();
            const health = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                metrics: {
                    enabled: config.metrics.METRICS_ENABLED,
                    registryWorking: metrics.length > 0,
                    contentType: register.contentType
                }
            };
            requestLogger.info({
                message: 'Metrics health check successful',
                health,
            });
            return reply.status(200).send(health);
        }
        catch (error) {
            requestLogger.error({
                message: 'Metrics health check failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return reply.status(500).send({
                status: 'unhealthy',
                error: 'Metrics registry not responding'
            });
        }
    });
}
//# sourceMappingURL=metrics.js.map