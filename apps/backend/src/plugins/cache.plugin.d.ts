import type { FastifyPluginCallback } from 'fastify';
import { type CacheOptions } from '../lib/cache.service.js';
declare module 'fastify' {
    interface FastifyInstance {
        cache: ReturnType<typeof import('redis').createClient>;
    }
}
export interface CachePluginOptions extends CacheOptions {
    enabled?: boolean;
}
/**
 * Cache Plugin for Fastify
 *
 * Integrates Redis caching service with Fastify application
 */
export declare const cachePlugin: FastifyPluginCallback<CachePluginOptions>;
//# sourceMappingURL=cache.plugin.d.ts.map