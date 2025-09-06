/**
 * Configuration Index
 * Provides typed config instance and safe getters
 */
import { loadConfig } from './env.js';
// Load configuration once at module load time
export const config = loadConfig();
// Feature gate helpers
export function isFeatureEnabled(feature) {
    switch (feature) {
        case 'xero':
            return config.xero.enabled;
        case 'files':
            return !!config.files.tokenSecret;
        default:
            return false;
    }
}
// Safe getters for common config values
export const serverConfig = {
    port: config.server.PORT,
    host: config.server.HOST,
    corsOrigin: config.server.CORS_ORIGIN,
    logLevel: config.server.LOG_LEVEL,
    nodeEnv: config.server.NODE_ENV,
    logCloudShipping: config.server.LOG_CLOUD_SHIPPING,
};
export const authConfig = {
    jwtSecret: config.auth.JWT_SECRET,
    accessTokenTtl: config.auth.ACCESS_TOKEN_TTL,
    refreshTokenTtl: config.auth.REFRESH_TOKEN_TTL,
    jwtIssuer: config.auth.JWT_ISSUER,
    jwtAudience: config.auth.JWT_AUDIENCE,
    cookieSecret: config.auth.COOKIE_SECRET,
    cookieSecure: config.auth.COOKIE_SECURE,
};
export const redisConfig = {
    url: config.redis.REDIS_URL,
};
export const dbConfig = {
    url: config.db.DATABASE_URL,
};
export const metricsConfig = {
    enabled: config.metrics.METRICS_ENABLED,
    port: config.metrics.METRICS_PORT,
    path: config.metrics.METRICS_PATH,
};
export const rateLimitConfig = {
    enabled: config.rateLimit.RATE_LIMIT_ENABLED,
    max: config.rateLimit.RATE_LIMIT_MAX,
    window: config.rateLimit.RATE_LIMIT_WINDOW,
    unauth: config.rateLimit.RATE_LIMIT_UNAUTH_MAX,
    auth: config.rateLimit.RATE_LIMIT_AUTH_MAX,
    admin: config.rateLimit.RATE_LIMIT_ADMIN_MAX,
    login: config.rateLimit.RATE_LIMIT_LOGIN_MAX,
};
export const xeroConfig = {
    enabled: config.xero.enabled,
    clientId: config.xero.clientId,
    clientSecret: config.xero.clientSecret,
    redirectUri: config.xero.redirectUri,
    tenantId: config.xero.tenantId,
    webhookKey: config.xero.webhookKey,
};
//# sourceMappingURL=index.js.map