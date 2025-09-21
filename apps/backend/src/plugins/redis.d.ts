/**
 * Redis Plugin for Auth Hardening
 * Provides Redis client for opaque session storage
 */
import { createClient } from "redis";
declare module "fastify" {
    interface FastifyInstance {
        cache: ReturnType<typeof createClient>;
    }
}
declare const _default: (fastify: import("fastify").FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>) => Promise<void>;
export default _default;
//# sourceMappingURL=redis.d.ts.map