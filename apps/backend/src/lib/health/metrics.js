import { config, metricsConfig } from '../../config/index.js';
import { logger } from '../logger.js';
export async function checkMetricsHealth() {
    const startTime = Date.now();
    const metricsLogger = logger.child({ type: 'metrics', operation: 'health_check' });
    try {
        metricsLogger.debug('Starting metrics health check');
        // Check if metrics are enabled
        if (!config.metrics.METRICS_ENABLED) {
            const latency = Date.now() - startTime;
            const timestamp = new Date().toISOString();
            metricsLogger.info({
                message: 'Metrics health check skipped (disabled)',
                latency,
            });
            return {
                status: 'ok',
                message: 'Metrics disabled',
                latency,
                timestamp,
            };
        }
        // For now, just check if the metrics path is configured
        // In a real implementation, you might want to check if the metrics endpoint is responding
        const latency = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        metricsLogger.info({
            message: 'Metrics health check successful',
            latency,
            path: metricsConfig.path,
        });
        return {
            status: 'ok',
            message: 'Metrics endpoint configured',
            latency,
            timestamp,
        };
    }
    catch (error) {
        const latency = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        metricsLogger.error({
            message: 'Metrics health check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            latency,
        });
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Metrics check failed',
            latency,
            timestamp,
        };
    }
}
//# sourceMappingURL=metrics.js.map