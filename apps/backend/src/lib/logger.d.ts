import { pino } from 'pino';
export declare const logger: import("pino").Logger<never>;
export declare function createRequestLogger(requestId: string, route?: string): pino.Logger<never>;
export declare function createDbLogger(operation: string, table?: string): pino.Logger<never>;
export declare function createRedisLogger(operation: string, key?: string): pino.Logger<never>;
export type Logger = typeof logger;
export type RequestLogger = ReturnType<typeof createRequestLogger>;
export type DbLogger = ReturnType<typeof createDbLogger>;
export type RedisLogger = ReturnType<typeof createRedisLogger>;
//# sourceMappingURL=logger.d.ts.map