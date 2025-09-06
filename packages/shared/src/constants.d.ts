export declare const APP_NAME = "Pivotal Flow";
export declare const APP_VERSION = "0.1.0";
export declare const APP_DESCRIPTION = "Business Management Platform";
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const NODE_ENV: {
    readonly DEVELOPMENT: "development";
    readonly TEST: "test";
    readonly STAGING: "staging";
    readonly PRODUCTION: "production";
};
export declare const LOG_LEVEL: {
    readonly ERROR: "error";
    readonly WARN: "warn";
    readonly INFO: "info";
    readonly DEBUG: "debug";
};
export declare const DATABASE: {
    readonly DEFAULT_PORT: 5432;
    readonly DEFAULT_HOST: "localhost";
    readonly DEFAULT_DATABASE: "pivotal";
    readonly DEFAULT_USER: "pivotal";
    readonly CONNECTION_TIMEOUT: 30000;
    readonly IDLE_TIMEOUT: 10000;
    readonly MAX_CONNECTIONS: 20;
};
export declare const REDIS: {
    readonly DEFAULT_PORT: 6379;
    readonly DEFAULT_HOST: "localhost";
    readonly DEFAULT_DB: 0;
    readonly CONNECTION_TIMEOUT: 10000;
    readonly KEY_PREFIX: "pivotal:";
    readonly SESSION_TTL: 86400;
    readonly CACHE_TTL: 3600;
};
export declare const METRICS: {
    readonly DEFAULT_PORT: 9090;
    readonly DEFAULT_PATH: "/metrics";
    readonly COLLECT_INTERVAL: 15000;
};
export declare const API: {
    readonly DEFAULT_PORT: 3000;
    readonly DEFAULT_HOST: "localhost";
    readonly RATE_LIMIT_WINDOW: number;
    readonly RATE_LIMIT_MAX: 100;
    readonly REQUEST_TIMEOUT: 30000;
    readonly CORS_ORIGIN: readonly ["http://localhost:3000", "http://localhost:3001"];
};
export declare const SECURITY: {
    readonly JWT_EXPIRES_IN: "8h";
    readonly PASSWORD_MIN_LENGTH: 8;
    readonly PASSWORD_MAX_LENGTH: 128;
    readonly SESSION_SECRET_LENGTH: 32;
    readonly RATE_LIMIT_ENABLED: true;
};
//# sourceMappingURL=constants.d.ts.map