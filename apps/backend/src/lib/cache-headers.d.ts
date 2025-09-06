/**
 * Cache Headers Implementation for D3 Contract Stability
 * Provides ETag, Last-Modified, and Cache-Control headers based on resource volatility
 */
import type { FastifyReply } from 'fastify';
export interface CacheOptions {
    maxAge?: number;
    sMaxAge?: number;
    mustRevalidate?: boolean;
    noCache?: boolean;
    noStore?: boolean;
    private?: boolean;
    public?: boolean;
    immutable?: boolean;
}
export interface ResourceMetadata {
    lastModified?: Date;
    etag?: string;
    contentType?: string;
    contentLength?: number;
}
/**
 * Generate ETag from content
 */
export declare function generateETag(content: string | Buffer | object): string;
/**
 * Generate ETag from resource metadata
 */
export declare function generateETagFromMetadata(metadata: ResourceMetadata): string;
/**
 * Set cache headers based on resource volatility
 */
export declare function setCacheHeaders(reply: FastifyReply, resourceType: 'static' | 'dynamic' | 'userData' | 'sensitive', options?: CacheOptions, metadata?: ResourceMetadata): void;
/**
 * Check if request has valid conditional headers
 */
export declare function hasValidConditionalHeaders(request: any): boolean;
/**
 * Check if ETag matches (for 304 Not Modified)
 */
export declare function etagMatches(request: any, etag: string): boolean;
/**
 * Check if resource was modified since last request
 */
export declare function wasModifiedSince(request: any, lastModified: Date): boolean;
/**
 * Send 304 Not Modified response
 */
export declare function sendNotModified(reply: FastifyReply): void;
/**
 * Cache headers for different resource types
 */
export declare const CACHE_PRESETS: {
    readonly static: CacheOptions;
    readonly dynamic: CacheOptions;
    readonly userData: CacheOptions;
    readonly sensitive: CacheOptions;
    readonly api: CacheOptions;
};
//# sourceMappingURL=cache-headers.d.ts.map