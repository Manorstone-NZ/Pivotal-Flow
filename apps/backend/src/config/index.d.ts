/**
 * Configuration Index
 * Provides typed config instance and safe getters
 */
export declare const config: import("./env.js").Config;
export declare function isFeatureEnabled(feature: 'xero' | 'files'): boolean;
export declare const serverConfig: {
    readonly port: number;
    readonly host: string;
    readonly corsOrigin: string;
    readonly logLevel: "debug" | "fatal" | "error" | "warn" | "info" | "trace";
    readonly nodeEnv: "development" | "staging" | "production" | "test";
    readonly logCloudShipping: boolean;
};
export declare const authConfig: {
    readonly jwtSecret: string;
    readonly accessTokenTtl: string;
    readonly refreshTokenTtl: string;
    readonly jwtIssuer: string;
    readonly jwtAudience: string;
    readonly cookieSecret: string;
    readonly cookieSecure: boolean;
};
export declare const redisConfig: {
    readonly url: string;
};
export declare const dbConfig: {
    readonly url: string;
};
export declare const metricsConfig: {
    readonly enabled: boolean;
    readonly port: number;
    readonly path: string;
};
export declare const rateLimitConfig: {
    readonly enabled: boolean;
    readonly max: number;
    readonly window: number;
    readonly unauth: number;
    readonly auth: number;
    readonly admin: number;
    readonly login: number;
};
export declare const xeroConfig: {
    readonly enabled: boolean;
    readonly clientId: string | undefined;
    readonly clientSecret: string | undefined;
    readonly redirectUri: string | undefined;
    readonly tenantId: string | undefined;
    readonly webhookKey: string | undefined;
};
export type { Config } from './env.js';
//# sourceMappingURL=index.d.ts.map