/**
 * Cache Headers Implementation for D3 Contract Stability
 * Provides ETag, Last-Modified, and Cache-Control headers based on resource volatility
 */

import type { FastifyReply } from 'fastify';
import crypto from 'crypto';

export interface CacheOptions {
  maxAge?: number; // seconds
  sMaxAge?: number; // seconds for shared caches
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
export function generateETag(content: string | Buffer | object): string {
  const data = typeof content === 'string' ? content : JSON.stringify(content);
  const hash = crypto.createHash('md5').update(data).digest('hex');
  return `"${hash}"`;
}

/**
 * Generate ETag from resource metadata
 */
export function generateETagFromMetadata(metadata: ResourceMetadata): string {
  const data = JSON.stringify({
    lastModified: metadata.lastModified?.toISOString(),
    contentType: metadata.contentType,
    contentLength: metadata.contentLength
  });
  return generateETag(data);
}

/**
 * Set cache headers based on resource volatility
 */
export function setCacheHeaders(
  reply: FastifyReply,
  resourceType: 'static' | 'dynamic' | 'userData' | 'sensitive',
  options: CacheOptions = {},
  metadata?: ResourceMetadata
): void {
  const headers: Record<string, string> = {};

  // Set ETag if metadata provided
  if (metadata?.etag) {
    headers['ETag'] = metadata.etag;
  } else if (metadata) {
    headers['ETag'] = generateETagFromMetadata(metadata);
  }

  // Set Last-Modified if provided
  if (metadata?.lastModified) {
    headers['Last-Modified'] = metadata.lastModified.toUTCString();
  }

  // Set Cache-Control based on resource type
  const cacheControl = buildCacheControlHeader(resourceType, options);
  if (cacheControl) {
    headers['Cache-Control'] = cacheControl;
  }

  // Apply headers
  Object.entries(headers).forEach(([key, value]) => {
    reply.header(key, value);
  });
}

/**
 * Build Cache-Control header based on resource type
 */
function buildCacheControlHeader(resourceType: string, options: CacheOptions): string {
  const directives: string[] = [];

  // Handle explicit options
  if (options.noStore) {
    return 'no-store';
  }
  
  if (options.noCache) {
    directives.push('no-cache');
  }

  if (options.private) {
    directives.push('private');
  } else if (options.public) {
    directives.push('public');
  }

  if (options.immutable) {
    directives.push('immutable');
  }

  if (options.mustRevalidate) {
    directives.push('must-revalidate');
  }

  // Set max-age based on resource type if not explicitly provided
  const maxAge = options.maxAge ?? getDefaultMaxAge(resourceType);
  if (maxAge > 0) {
    directives.push(`max-age=${maxAge}`);
  }

  if (options.sMaxAge !== undefined) {
    directives.push(`s-maxage=${options.sMaxAge}`);
  }

  return directives.join(', ');
}

/**
 * Get default max-age based on resource type
 */
function getDefaultMaxAge(resourceType: string): number {
  switch (resourceType) {
    case 'static':
      return 86400; // 24 hours
    case 'dynamic':
      return 300; // 5 minutes
    case 'user-data':
      return 60; // 1 minute
    case 'sensitive':
      return 0; // no cache
    default:
      return 300; // 5 minutes
  }
}

/**
 * Check if request has valid conditional headers
 */
export function hasValidConditionalHeaders(request: any): boolean {
  const ifNoneMatch = request.headers['if-none-match'];
  const ifModifiedSince = request.headers['if-modified-since'];
  
  return !!(ifNoneMatch || ifModifiedSince);
}

/**
 * Check if ETag matches (for 304 Not Modified)
 */
export function etagMatches(request: any, etag: string): boolean {
  const ifNoneMatch = request.headers['if-none-match'];
  if (!ifNoneMatch) return false;
  
  // Handle weak ETags
  const cleanEtag = etag.replace(/^W\//, '');
  const cleanIfNoneMatch = ifNoneMatch.replace(/^W\//, '');
  
  return cleanIfNoneMatch === cleanEtag || ifNoneMatch === '*';
}

/**
 * Check if resource was modified since last request
 */
export function wasModifiedSince(request: any, lastModified: Date): boolean {
  const ifModifiedSince = request.headers['if-modified-since'];
  if (!ifModifiedSince) return true;
  
  const ifModifiedSinceDate = new Date(ifModifiedSince);
  return lastModified > ifModifiedSinceDate;
}

/**
 * Send 304 Not Modified response
 */
export function sendNotModified(reply: FastifyReply): void {
  reply.status(304).send();
}

/**
 * Cache headers for different resource types
 */
export const CACHE_PRESETS = {
  static: { maxAge: 86400, public: true } as CacheOptions,
  dynamic: { maxAge: 300, private: true } as CacheOptions,
  userData: { maxAge: 60, private: true, mustRevalidate: true } as CacheOptions,
  sensitive: { noStore: true } as CacheOptions,
  api: { maxAge: 0, noCache: true, mustRevalidate: true } as CacheOptions
} as const;

