import { pino } from 'pino';
import { config } from '../config/index.js';
// Create the logger instance
const loggerOptions = {
    level: config.server.LOG_LEVEL,
    formatters: {
        level: (label) => ({ level: label }),
        log: (object) => {
            // Ensure timestamp is always present
            if (!('time' in object)) {
                object['time'] = new Date().toISOString();
            }
            return object;
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
        env: config.server.NODE_ENV,
        version: '0.1.0',
    },
};
// Check if cloud shipping is enabled
const isCloudShipping = config.server.LOG_CLOUD_SHIPPING;
if (config.server.NODE_ENV !== 'production' && !isCloudShipping) {
    loggerOptions.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    };
}
export const logger = pino(loggerOptions);
// Create a child logger for requests
export function createRequestLogger(requestId, route) {
    return logger.child({
        requestId,
        route,
        type: 'request',
    });
}
// Create a child logger for database operations
export function createDbLogger(operation, table) {
    return logger.child({
        type: 'database',
        operation,
        table,
    });
}
// Create a child logger for Redis operations
export function createRedisLogger(operation, key) {
    return logger.child({
        type: 'redis',
        operation,
        key,
    });
}
//# sourceMappingURL=logger.js.map