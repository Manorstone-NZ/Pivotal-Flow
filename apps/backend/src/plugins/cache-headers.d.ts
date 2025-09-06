/**
 * Cache Headers Plugin for D3 Contract Stability
 * Automatically applies appropriate cache headers based on route patterns
 */
import type { FastifyPluginCallback } from 'fastify';
export interface CacheHeadersPluginOptions {
    enableETag?: boolean;
    enableLastModified?: boolean;
    defaultResourceType?: 'static' | 'dynamic' | 'userData' | 'sensitive';
}
export declare const cacheHeadersPlugin: FastifyPluginCallback<CacheHeadersPluginOptions>;
/**
 * Helper to add cache headers to specific routes
 */
export declare function addCacheHeadersToRoute(reply: any, resourceType: 'static' | 'dynamic' | 'userData' | 'sensitive', options?: any, metadata?: any): void;
/**
 * Helper to check and send 304 Not Modified
 */
export declare function handleConditionalRequest(request: any, reply: any, etag?: string, lastModified?: Date): boolean;
//# sourceMappingURL=cache-headers.d.ts.map