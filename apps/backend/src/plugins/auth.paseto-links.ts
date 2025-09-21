/**
 * PASETO Links Plugin
 * Implements PASETO v4 public tokens for signed links
 * Only registers when AUTH_ENABLE_PASETO_LINKS=true
 */

import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { PasetoKeyManager, verifyLink, generateQuoteLink } from '../services/paseto.js';
import { AuthenticationError, AuthorizationError } from '../lib/error-handler.js';
import { logger } from '../lib/logger.js';

declare module 'fastify' {
  interface FastifyInstance {
    pasetoKeyManager: PasetoKeyManager;
    generateQuoteLink: (tenantId: string, quoteId: string, expiryDays?: number) => Promise<string>;
    verifyQuoteLink: (token: string) => Promise<{ tenantId: string; quoteId: string } | null>;
  }
}

// Public routes that use PASETO tokens
const PASETO_PUBLIC_ROUTES = [
  '/public/quotes/',
  '/public/invoices/',
  '/api/public/'
];

/**
 * Check if route should use PASETO authentication
 */
function shouldUsePasetoAuth(url: string): boolean {
  return PASETO_PUBLIC_ROUTES.some(route => url.includes(route));
}

/**
 * Extract PASETO token from URL path
 */
function extractPasetoToken(request: FastifyRequest): string | null {
  const pathParts = request.url.split('/');
  
  // Look for token in path like /public/quotes/:token
  const tokenIndex = pathParts.findIndex(part => 
    part === 'quotes' || part === 'invoices'
  ) + 1;
  
  if (tokenIndex > 0 && pathParts[tokenIndex]) {
    const token = pathParts[tokenIndex].split('?')[0]; // Remove query params
    // PASETO tokens start with v4.public.
    if (token.startsWith('v4.public.')) {
      return token;
    }
  }
  
  return null;
}

/**
 * PASETO Links Plugin
 */
export const pasetoLinksPlugin: FastifyPluginAsync = fp(async (fastify) => {
  // Initialize PASETO key manager
  const keyManager = new PasetoKeyManager();
  await keyManager.loadKeys(); // Ensure keys are loaded
  
  // Decorate fastify instance
  fastify.decorate('pasetoKeyManager', keyManager);
  
  // Helper functions
  fastify.decorate('generateQuoteLink', async (tenantId: string, quoteId: string, expiryDays = 30) => {
    return generateQuoteLink(keyManager, tenantId, quoteId, expiryDays);
  });
  
  fastify.decorate('verifyQuoteLink', async (token: string) => {
    return verifyQuoteLink(keyManager, token);
  });
  
  // PASETO token validation middleware
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Only apply to PASETO public routes when flag is enabled
    if (!shouldUsePasetoAuth(request.url)) {
      return;
    }
    
    const token = extractPasetoToken(request);
    if (!token) {
      throw new AuthenticationError('PASETO token required for public access');
    }
    
    try {
      const publicKey = await keyManager.getPublicKey();
      const payload = await verifyLink(publicKey, token, {
        audience: 'pivotal-flow-public',
        issuer: 'pivotal-flow-auth',
        clockTolerance: 60
      });
      
      if (!payload) {
        throw new AuthenticationError('Invalid or expired PASETO token');
      }
      
      // Validate scope for the requested operation
      if (!payload.scope?.includes('quote:read') && request.url.includes('/quotes/')) {
        throw new AuthorizationError('Insufficient scope for quote access');
      }
      
      // Attach PASETO context to request
      (request as any).pasetoToken = {
        tenantId: payload.org,
        resourceId: payload.resource,
        resourceType: payload.resourceType,
        purpose: payload.purpose,
        scope: payload.scope,
        sub: payload.sub,
        jti: payload.jti
      };
      
      logger.debug({ 
        tokenId: payload.jti,
        tenantId: payload.org,
        resource: payload.resource,
        purpose: payload.purpose
      }, 'PASETO token validated');
      
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }
      
      logger.warn({ 
        err: error.message,
        token: token.substring(0, 20) + '...',
        url: request.url
      }, 'PASETO token validation failed');
      
      throw new AuthenticationError('PASETO token validation failed');
    }
  });
  
  logger.info('PASETO links plugin registered (AUTH_ENABLE_PASETO_LINKS=true)');
}, {
  name: 'paseto-links',
  dependencies: []
});
