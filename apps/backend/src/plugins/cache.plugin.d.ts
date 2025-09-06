import type { CacheApi } from '@pivotal-flow/shared';
import type { FastifyPluginCallback } from 'fastify';
import { type CacheOptions } from '../lib/cache.service.js';
declare module 'fastify' {
    interface FastifyInstance {
        cache: CacheApi;
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