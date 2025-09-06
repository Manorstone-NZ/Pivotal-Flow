/**
 * Cache Headers Plugin for D3 Contract Stability
 * Automatically applies appropriate cache headers based on route patterns
 */
import { setCacheHeaders, CACHE_PRESETS, hasValidConditionalHeaders, etagMatches, wasModifiedSince, sendNotModified } from '../lib/cache-headers.js';
export const cacheHeadersPlugin = (app, _opts, done) => {
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
function getResourceTypeFromRoute(url) {
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
export function addCacheHeadersToRoute(reply, resourceType, options, metadata) {
    setCacheHeaders(reply, resourceType, options, metadata);
}
/**
 * Helper to check and send 304 Not Modified
 */
export function handleConditionalRequest(request, reply, etag, lastModified) {
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
//# sourceMappingURL=cache-headers.js.map