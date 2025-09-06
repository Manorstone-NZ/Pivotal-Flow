/**
 * Cache Headers Plugin for D3 Contract Stability
 * Automatically applies appropriate cache headers based on route patterns
 */

import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { setCacheHeaders, CACHE_PRESETS, hasValidConditionalHeaders, etagMatches, wasModifiedSince, sendNotModified } from '../lib/cache-headers.js';

export interface CacheHeadersPluginOptions {
  enableETag?: boolean;
  enableLastModified?: boolean;
  defaultResourceType?: 'static' | 'dynamic' | 'userData' | 'sensitive';
}

export const cacheHeadersPlugin: FastifyPluginCallback<CacheHeadersPluginOptions> = (app: FastifyInstance, _opts, done) => {

  // Apply cache headers to GET requests
  app.addHook('onSend', async (request, reply, payload) => {
    // Only apply to GET requests
    if (request.method !== 'GET') {
      return payload;
    }

    // Skip if already has cache headers
    if (reply.getHeader('Cache-Control')) {
      return payload;
    }

    // Determine resource type based on route
    const resourceType = getResourceTypeFromRoute(request.url);
    
    // Set cache headers
    setCacheHeaders(reply, resourceType, CACHE_PRESETS[resourceType]);

    return payload;
  });

  // Handle conditional requests for 304 Not Modified
  app.addHook('preHandler', async (request, _reply) => {
    // Only handle GET requests with conditional headers
    if (request.method !== 'GET' || !hasValidConditionalHeaders(request)) {
      return;
    }

    // This would need to be implemented per-route based on actual resource metadata
    // For now, we'll let the route handler decide
  });

  done();
};

/**
 * Determine resource type from route pattern
 */
function getResourceTypeFromRoute(url: string): 'static' | 'dynamic' | 'userData' | 'sensitive' {
  // Static resources
  if (url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return 'static';
  }

  // Sensitive data
  if (url.includes('/auth/') || url.includes('/users/') || url.includes('/permissions/')) {
    return 'sensitive';
  }

  // User-specific data
  if (url.includes('/me') || url.includes('/profile') || url.includes('/settings')) {
    return 'userData';
  }

  // API endpoints (default)
  return 'dynamic';
}

/**
 * Helper to add cache headers to specific routes
 */
export function addCacheHeadersToRoute(
  reply: any,
  resourceType: 'static' | 'dynamic' | 'userData' | 'sensitive',
  options?: any,
  metadata?: any
): void {
  setCacheHeaders(reply, resourceType, options, metadata);
}

/**
 * Helper to check and send 304 Not Modified
 */
export function handleConditionalRequest(
  request: any,
  reply: any,
  etag?: string,
  lastModified?: Date
): boolean {
  if (request.method !== 'GET') {
    return false;
  }

  // Check ETag
  if (etag && etagMatches(request.headers['if-none-match'], etag)) {
    sendNotModified(reply);
    return true;
  }

  // Check Last-Modified
  if (lastModified && !wasModifiedSince(request.headers['if-modified-since'], lastModified)) {
    sendNotModified(reply);
    return true;
  }

  return false;
}
