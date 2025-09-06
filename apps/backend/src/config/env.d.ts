/**
 * Environment Configuration Module
 * Centralized environment variable validation and configuration
 */
import { z } from 'zod';
export declare class ConfigError extends Error {
    readonly missingKeys: string[];
    readonly invalidValues: Record<string, string>;
    constructor(message: string, missingKeys?: string[], invalidValues?: Record<string, string>);
}
declare const ConfigSchema: z.ZodObject<{
    server: z.ZodObject<{
        PORT: z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>;
        HOST: z.ZodDefault<z.ZodString>;
        CORS_ORIGIN: z.ZodEffects<z.ZodString, string, string>;
        LOG_LEVEL: z.ZodDefault<z.ZodEnum<["fatal", "error", "warn", "info", "debug", "trace"]>>;
        NODE_ENV: z.ZodEnum<["development", "staging", "production", "test"]>;
        LOG_CLOUD_SHIPPING: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    }, "strip", z.ZodTypeAny, {
        PORT: number;
        HOST: string;
        CORS_ORIGIN: string;
        LOG_LEVEL: "debug" | "fatal" | "error" | "warn" | "info" | "trace";
        NODE_ENV: "development" | "staging" | "production" | "test";
        LOG_CLOUD_SHIPPING: boolean;
    }, {
        PORT: string;
        CORS_ORIGIN: string;
        NODE_ENV: "development" | "staging" | "production" | "test";
        HOST?: string | undefined;
        LOG_LEVEL?: "debug" | "fatal" | "error" | "warn" | "info" | "trace" | undefined;
        LOG_CLOUD_SHIPPING?: string | undefined;
    }>;
    auth: z.ZodObject<{
        JWT_SECRET: z.ZodString;
        ACCESS_TOKEN_TTL: z.ZodDefault<z.ZodString>;
        REFRESH_TOKEN_TTL: z.ZodDefault<z.ZodString>;
        JWT_ISSUER: z.ZodDefault<z.ZodString>;
        JWT_AUDIENCE: z.ZodDefault<z.ZodString>;
        COOKIE_SECRET: z.ZodDefault<z.ZodString>;
        COOKIE_SECURE: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    }, "strip", z.ZodTypeAny, {
        JWT_SECRET: string;
        ACCESS_TOKEN_TTL: string;
        REFRESH_TOKEN_TTL: string;
        JWT_ISSUER: string;
        JWT_AUDIENCE: string;
        COOKIE_SECRET: string;
        COOKIE_SECURE: boolean;
    }, {
        JWT_SECRET: string;
        ACCESS_TOKEN_TTL?: string | undefined;
        REFRESH_TOKEN_TTL?: string | undefined;
        JWT_ISSUER?: string | undefined;
        JWT_AUDIENCE?: string | undefined;
        COOKIE_SECRET?: string | undefined;
        COOKIE_SECURE?: string | undefined;
    }>;
    redis: z.ZodObject<{
        REDIS_URL: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        REDIS_URL: string;
    }, {
        REDIS_URL: string;
    }>;
    db: z.ZodObject<{
        DATABASE_URL: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        DATABASE_URL: string;
    }, {
        DATABASE_URL: string;
    }>;
    files: z.ZodObject<{
        FILE_TOKEN_SECRET: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        FILE_TOKEN_SECRET?: string | undefined;
    }, {
        FILE_TOKEN_SECRET?: string | undefined;
    }>;
    metrics: z.ZodObject<{
        METRICS_ENABLED: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
        METRICS_PORT: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
        METRICS_PATH: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        METRICS_ENABLED: boolean;
        METRICS_PORT: number;
        METRICS_PATH: string;
    }, {
        METRICS_ENABLED?: string | undefined;
        METRICS_PORT?: string | undefined;
        METRICS_PATH?: string | undefined;
    }>;
    rateLimit: z.ZodObject<{
        RATE_LIMIT_ENABLED: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
        RATE_LIMIT_MAX: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
        RATE_LIMIT_WINDOW: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
        RATE_LIMIT_UNAUTH_MAX: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
        RATE_LIMIT_AUTH_MAX: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
        RATE_LIMIT_ADMIN_MAX: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
        RATE_LIMIT_LOGIN_MAX: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        RATE_LIMIT_ENABLED: boolean;
        RATE_LIMIT_MAX: number;
        RATE_LIMIT_WINDOW: number;
        RATE_LIMIT_UNAUTH_MAX: number;
        RATE_LIMIT_AUTH_MAX: number;
        RATE_LIMIT_ADMIN_MAX: number;
        RATE_LIMIT_LOGIN_MAX: number;
    }, {
        RATE_LIMIT_ENABLED?: string | undefined;
        RATE_LIMIT_MAX?: string | undefined;
        RATE_LIMIT_WINDOW?: string | undefined;
        RATE_LIMIT_UNAUTH_MAX?: string | undefined;
        RATE_LIMIT_AUTH_MAX?: string | undefined;
        RATE_LIMIT_ADMIN_MAX?: string | undefined;
        RATE_LIMIT_LOGIN_MAX?: string | undefined;
    }>;
    xero: z.ZodObject<{
        XERO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        XERO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        XERO_REDIRECT_URI: z.ZodOptional<z.ZodString>;
        XERO_TENANT_ID: z.ZodOptional<z.ZodString>;
        XERO_WEBHOOK_KEY: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        XERO_CLIENT_ID?: string | undefined;
        XERO_CLIENT_SECRET?: string | undefined;
        XERO_REDIRECT_URI?: string | undefined;
        XERO_TENANT_ID?: string | undefined;
        XERO_WEBHOOK_KEY?: string | undefined;
    }, {
        XERO_CLIENT_ID?: string | undefined;
        XERO_CLIENT_SECRET?: string | undefined;
        XERO_REDIRECT_URI?: string | undefined;
        XERO_TENANT_ID?: string | undefined;
        XERO_WEBHOOK_KEY?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    server: {
        PORT: number;
        HOST: string;
        CORS_ORIGIN: string;
        LOG_LEVEL: "debug" | "fatal" | "error" | "warn" | "info" | "trace";
        NODE_ENV: "development" | "staging" | "production" | "test";
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
        FILE_TOKEN_SECRET?: string | undefined;
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
        XERO_CLIENT_ID?: string | undefined;
        XERO_CLIENT_SECRET?: string | undefined;
        XERO_REDIRECT_URI?: string | undefined;
        XERO_TENANT_ID?: string | undefined;
        XERO_WEBHOOK_KEY?: string | undefined;
    };
}, {
    server: {
        PORT: string;
        CORS_ORIGIN: string;
        NODE_ENV: "development" | "staging" | "production" | "test";
        HOST?: string | undefined;
        LOG_LEVEL?: "debug" | "fatal" | "error" | "warn" | "info" | "trace" | undefined;
        LOG_CLOUD_SHIPPING?: string | undefined;
    };
    auth: {
        JWT_SECRET: string;
        ACCESS_TOKEN_TTL?: string | undefined;
        REFRESH_TOKEN_TTL?: string | undefined;
        JWT_ISSUER?: string | undefined;
        JWT_AUDIENCE?: string | undefined;
        COOKIE_SECRET?: string | undefined;
        COOKIE_SECURE?: string | undefined;
    };
    redis: {
        REDIS_URL: string;
    };
    db: {
        DATABASE_URL: string;
    };
    files: {
        FILE_TOKEN_SECRET?: string | undefined;
    };
    metrics: {
        METRICS_ENABLED?: string | undefined;
        METRICS_PORT?: string | undefined;
        METRICS_PATH?: string | undefined;
    };
    rateLimit: {
        RATE_LIMIT_ENABLED?: string | undefined;
        RATE_LIMIT_MAX?: string | undefined;
        RATE_LIMIT_WINDOW?: string | undefined;
        RATE_LIMIT_UNAUTH_MAX?: string | undefined;
        RATE_LIMIT_AUTH_MAX?: string | undefined;
        RATE_LIMIT_ADMIN_MAX?: string | undefined;
        RATE_LIMIT_LOGIN_MAX?: string | undefined;
    };
    xero: {
        XERO_CLIENT_ID?: string | undefined;
        XERO_CLIENT_SECRET?: string | undefined;
        XERO_REDIRECT_URI?: string | undefined;
        XERO_TENANT_ID?: string | undefined;
        XERO_WEBHOOK_KEY?: string | undefined;
    };
}>;
export type Config = z.infer<typeof ConfigSchema> & {
    xero: {
        enabled: boolean;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        redirectUri?: string | undefined;
        tenantId?: string | undefined;
        webhookKey?: string | undefined;
    };
    files: {
        tokenSecret: string;
    };
};
/**
 * Load and validate environment configuration
 */
export declare function loadConfig(): Config;
export {};
//# sourceMappingURL=env.d.ts.map