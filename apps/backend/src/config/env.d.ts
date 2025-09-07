/**
 * Environment Configuration Module
 * Centralized environment variable validation and configuration
 */
export declare class ConfigError extends Error {
    readonly missingKeys: string[];
    readonly invalidValues: Record<string, string>;
    constructor(message: string, missingKeys?: string[], invalidValues?: Record<string, string>);
}
export interface Config {
    server: {
        PORT: number;
        HOST: string;
        CORS_ORIGIN: string;
        LOG_LEVEL: string;
        NODE_ENV: string;
        LOG_CLOUD_SHIPPING: boolean;
    };
    auth: {
        JWT_SECRET: string;
        ACCESS_TOKEN_TTL: string;
        REFRESH_TOKEN_TTL: string;
        JWT_ISSUER: string;
        JWT_AUDIENCE: string;
        COOKIE_SECRET: string;
        COOKIE_SECURE: boolean;
    };
    redis: {
        REDIS_URL: string;
    };
    db: {
        DATABASE_URL: string;
    };
    files: {
        tokenSecret: string;
    };
    metrics: {
        METRICS_ENABLED: boolean;
        METRICS_PORT: number;
        METRICS_PATH: string;
    };
    rateLimit: {
        RATE_LIMIT_ENABLED: boolean;
        RATE_LIMIT_MAX: number;
        RATE_LIMIT_WINDOW: number;
        RATE_LIMIT_UNAUTH_MAX: number;
        RATE_LIMIT_AUTH_MAX: number;
        RATE_LIMIT_ADMIN_MAX: number;
        RATE_LIMIT_LOGIN_MAX: number;
    };
    xero: {
        enabled: boolean;
        clientId?: string;
        clientSecret?: string;
        redirectUri?: string;
        tenantId?: string;
        webhookKey?: string;
    };
}
/**
 * Load and validate environment configuration
 */
export declare function loadConfig(): Config;
//# sourceMappingURL=env.d.ts.map