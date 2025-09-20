/**
 * Tenant Context Plugin
 * Handles multi-tenant data isolation at the database level
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

// Extend Fastify request interface to include tenant context
declare module 'fastify' {
  interface FastifyRequest {
    tenantId?: string | null;
  }
}

interface TenantContextOptions {
  // Optional configuration
}

async function tenantContextPlugin(fastify: FastifyInstance, _options: TenantContextOptions) {
  // Pre-handler hook to extract tenant context from headers
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip tenant context for public routes
    const publicRoutes = ['/health', '/auth/login', '/auth/register', '/auth/refresh'];
    const isPublicRoute = publicRoutes.some(route => request.url.includes(route));
    
    if (isPublicRoute) {
      request.tenantId = null;
      return;
    }

    // Extract tenant ID from X-Tenant-ID header
    const tenantId = request.headers['x-tenant-id'] as string;
    
    if (tenantId) {
      // Validate tenant ID format (should be a valid UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(tenantId)) {
        fastify.log.warn({ tenantId, url: request.url }, 'Invalid tenant ID format');
        return reply.status(400).send({ error: 'Invalid tenant ID format' });
      }

      request.tenantId = tenantId;
      fastify.log.info({ 
        tenantId, 
        method: request.method, 
        url: request.url,
        userAgent: request.headers['user-agent']
      }, 'Tenant context set');
    } else {
      // For authenticated routes without tenant context, this might be a super-admin operation
      // or a system-wide operation. We'll allow it but log it.
      request.tenantId = null;
      
      // Only log for non-system routes
      if (!request.url.includes('/organizations') && !request.url.includes('/auth/me')) {
        fastify.log.info({ 
          method: request.method, 
          url: request.url,
          warning: 'This might indicate missing tenant context or super-admin operation'
        }, 'No tenant context provided');
      }
    }
  });

  // Helper function to get tenant context from request
  fastify.decorate('getTenantId', (request: FastifyRequest): string | null => {
    return request.tenantId || null;
  });

  // Helper function to ensure tenant context exists
  fastify.decorate('requireTenantContext', (request: FastifyRequest, reply: FastifyReply): string => {
    const tenantId = request.tenantId;
    if (!tenantId) {
      reply.status(400).send({ error: 'Tenant context required but not provided' });
      throw new Error('Tenant context required');
    }
    return tenantId;
  });
}

// Extend Fastify instance interface
declare module 'fastify' {
  interface FastifyInstance {
    getTenantId(request: FastifyRequest): string | null;
    requireTenantContext(request: FastifyRequest, reply: FastifyReply): string;
  }
}

export default fp(tenantContextPlugin, {
  name: 'tenant-context',
  dependencies: [],
});
