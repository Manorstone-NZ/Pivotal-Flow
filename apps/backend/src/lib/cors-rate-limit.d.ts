/**
 * CORS and Rate Limiting Configuration for C0 Backend Readiness
 * Environment-specific policies and per-route rate limits
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
export declare const CORS_CONFIG: {
    development: {
        origin: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
        exposedHeaders: string[];
    };
    staging: {
        origin: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
        exposedHeaders: string[];
    };
    production: {
        origin: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
        exposedHeaders: string[];
    };
};
export declare const RATE_LIMIT_CONFIG: {
    default: {
        max: number;
        timeWindow: string;
        allowList: string[];
        keyGenerator: (request: FastifyRequest) => string;
    };
    portal: {
        max: number;
        timeWindow: string;
        allowList: string[];
        keyGenerator: (request: FastifyRequest) => string;
    };
    auth: {
        max: number;
        timeWindow: string;
        allowList: string[];
        keyGenerator: (request: FastifyRequest) => string;
    };
    export: {
        max: number;
        timeWindow: string;
        allowList: string[];
        keyGenerator: (request: FastifyRequest) => string;
    };
    reports: {
        max: number;
        timeWindow: string;
        allowList: string[];
        keyGenerator: (request: FastifyRequest) => string;
    };
    health: {
        max: number;
        timeWindow: string;
        allowList: string[];
        keyGenerator: (request: FastifyRequest) => string;
    };
};
export declare const ROUTE_RATE_LIMITS: {
    '/portal': string;
    '/portal/quotes': string;
    '/portal/invoices': string;
    '/portal/time': string;
    '/auth/login': string;
    '/auth/refresh': string;
    '/auth/logout': string;
    '/auth/mfa': string;
    '/reports/export': string;
    '/reports/export/': string;
    '/reports/summary': string;
    '/reports/': string;
    '/health': string;
    '/metrics': string;
    '/docs': string;
    '/docs/json': string;
    '/api/openapi.json': string;
};
/**
 * Get CORS configuration for current environment
 */
export declare function getCorsConfig(): {
    origin: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
};
/**
 * Get rate limit configuration for a route
 */
export declare function getRateLimitConfig(route: string): typeof RATE_LIMIT_CONFIG[keyof typeof RATE_LIMIT_CONFIG];
/**
 * Create rate limit configuration for Fastify
 */
export declare function createRateLimitConfig(route: string): {
    max: number;
    timeWindow: string;
    allowList: string[];
    keyGenerator: ((request: FastifyRequest) => string) | ((request: FastifyRequest) => string) | ((request: FastifyRequest) => string) | ((request: FastifyRequest) => string) | ((request: FastifyRequest) => string) | ((request: FastifyRequest) => string);
    errorResponseBuilder: (request: FastifyRequest, context: {
        max: number;
        remaining: number;
        resetTime: number;
    }) => {
        error: {
            code: string;
            message: string;
            details: {
                limit: number;
                remaining: number;
                reset: number;
            };
            timestamp: string;
            request_id: string;
        };
        meta: {
            api_version: string;
            documentation_url: string;
        };
    };
    onExceeded: (_request: FastifyRequest, _reply: FastifyReply) => void;
};
/**
 * Rate limit headers middleware
 */
export declare function rateLimitHeadersMiddleware(_request: FastifyRequest, reply: FastifyReply, done: () => void): void;
/**
 * Security headers middleware
 */
export declare function securityHeadersMiddleware(_request: FastifyRequest, reply: FastifyReply, done: () => void): void;
/**
 * CORS preflight handler
 */
export declare function corsPreflightHandler(request: FastifyRequest, reply: FastifyReply): void;
/**
 * Environment-specific configuration validation
 */
export declare function validateEnvironmentConfig(): void;
//# sourceMappingURL=cors-rate-limit.d.ts.map