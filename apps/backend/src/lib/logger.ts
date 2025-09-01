import { pino } from 'pino';
import { config } from './config.js';

// Create the logger instance
const loggerOptions: pino.LoggerOptions = {
  level: config.logging.level,
  formatters: {
    level: (label) => ({ level: label }),
    log: (object: Record<string, unknown>) => {
      // Ensure timestamp is always present
      if (!('time' in object)) {
        object['time'] = new Date().toISOString();
      }
      return object;
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: config.env,
    version: '0.1.0',
  },
};

// Check if cloud shipping is enabled
const isCloudShipping = process.env['LOG_CLOUD_SHIPPING'] === 'true';

if (config.logging.pretty && !config.isProduction && !isCloudShipping) {
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
export function createRequestLogger(requestId: string, route?: string) {
  return logger.child({
    requestId,
    route,
    type: 'request',
  });
}

// Create a child logger for database operations
export function createDbLogger(operation: string, table?: string) {
  return logger.child({
    type: 'database',
    operation,
    table,
  });
}

// Create a child logger for Redis operations
export function createRedisLogger(operation: string, key?: string) {
  return logger.child({
    type: 'redis',
    operation,
    key,
  });
}

// Export logger types
export type Logger = typeof logger;
export type RequestLogger = ReturnType<typeof createRequestLogger>;
export type DbLogger = ReturnType<typeof createDbLogger>;
export type RedisLogger = ReturnType<typeof createRedisLogger>;
