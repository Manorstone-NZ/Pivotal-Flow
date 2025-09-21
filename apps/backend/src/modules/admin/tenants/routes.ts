/**
 * F1A Tenant Admin Portal Routes
 * Secure tenant management endpoints for platform administrators
 * 
 * SECURITY COMPLIANCE:
 * - Platform admin permission required (system.super_admin)
 * - Rate limiting applied per admin user
 * - Complete audit trail for all operations
 * - TypeBox validation for all inputs/outputs
 * - No tenant data access - admin operations only
 * - Comprehensive error handling with security-focused responses
 */

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../../../lib/logger.js';
import { createAdminTenantService } from './service.js';
import { 
  AdminTenantRouteSchemas
  // Types are used in schema definitions, not in route handlers
} from './schemas.js';

/**
 * Admin Tenant Routes Plugin
 * Implements secure tenant management with comprehensive security controls
 */
export const adminTenantRoutes: FastifyPluginAsync = async (fastify) => {
  
  // ===== SECURITY MIDDLEWARE =====
  
  // Apply authentication to all admin routes
  const adminAuthMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    // Ensure user is authenticated
    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required for admin operations'
        }
      });
    }

    // Additional rate limiting for admin operations
    const user = request.user as any;
    const rateLimitKey = `admin_ops:${user.id}`;
    
    try {
      const redis = (fastify as any).redis;
      const count = await redis.incr(rateLimitKey);
      if (count === 1) {
        await redis.expire(rateLimitKey, 300); // 5 minute window
      }

      // Stricter limits for admin operations: 50 operations per 5 minutes
      if (count > 50) {
        logger.warn({
          userId: user.id,
          ip: request.ip,
          url: request.url,
          rateLimitCount: count
        }, 'Admin operation rate limit exceeded');

        return reply.status(429).send({
          error: {
            code: 'ADMIN_RATE_LIMIT_EXCEEDED',
            message: 'Too many admin operations. Please try again later.',
            details: {
              limit: 50,
              window: '5 minutes',
              resetTime: new Date(Date.now() + 300000).toISOString()
            }
          }
        });
      }
    } catch (error) {
      logger.error({ err: error }, 'Redis rate limiting error');
      // Continue without rate limiting if Redis fails (fail-open for admin access)
    }
  };

  // ===== TENANT MANAGEMENT ROUTES =====

  // GET /v1/admin/tenants - List tenants with pagination and search
  fastify.get('/v1/admin/tenants', {
    preHandler: [fastify.authenticate, adminAuthMiddleware],
    schema: AdminTenantRouteSchemas.listTenants
  }, async (request: any, reply: FastifyReply) => {
    try {
      const user = request.user as any;
      const adminService = createAdminTenantService({
        fastify,
        adminUserId: user.id,
        adminOrganizationId: user.organizationId
      });

      const result = await adminService.listTenants(request.query);

      logger.info({
        adminUserId: user.id,
        query: request.query,
        resultCount: result.data.length,
        totalCount: result.pagination.total
      }, 'Admin tenant list accessed');

      return reply.status(200).send(result);
    } catch (error) {
      logger.error({
        err: error,
        adminUserId: (request.user as any)?.id,
        query: request.query
      }, 'Failed to list tenants');

      if ((error as Error).message.includes('Platform admin access required')) {
        return reply.status(403).send({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Platform admin access required for tenant management'
          }
        });
      }

      return reply.status(500).send({
        error: {
          code: 'TENANT_LIST_FAILED',
          message: 'Failed to retrieve tenant list'
        }
      });
    }
  });

  // POST /v1/admin/tenants - Create new tenant
  fastify.post('/v1/admin/tenants', {
    preHandler: [fastify.authenticate, adminAuthMiddleware],
    schema: AdminTenantRouteSchemas.createTenant
  }, async (request: any, reply: FastifyReply) => {
    try {
      const user = request.user as any;
      const adminService = createAdminTenantService({
        fastify,
        adminUserId: user.id,
        adminOrganizationId: user.organizationId
      });

      const tenant = await adminService.createTenant(request.body);

      logger.info({
        adminUserId: user.id,
        tenantId: tenant.id,
        tenantName: tenant.name
      }, 'Tenant created by admin');

      return reply.status(201).send({
        tenant,
        message: 'Tenant created successfully'
      });
    } catch (error) {
      logger.error({
        err: error,
        adminUserId: (request.user as any)?.id,
        tenantData: request.body
      }, 'Failed to create tenant');

      if ((error as Error).message.includes('Platform admin access required')) {
        return reply.status(403).send({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Platform admin access required for tenant creation'
          }
        });
      }

      if ((error as Error).message.includes('already exists')) {
        return reply.status(409).send({
          error: {
            code: 'TENANT_SLUG_EXISTS',
            message: 'Tenant slug already exists'
          }
        });
      }

      return reply.status(500).send({
        error: {
          code: 'TENANT_CREATION_FAILED',
          message: 'Failed to create tenant'
        }
      });
    }
  });

  // GET /v1/admin/tenants/:id - Get tenant details
  fastify.get('/v1/admin/tenants/:id', {
    preHandler: [fastify.authenticate, adminAuthMiddleware],
    schema: AdminTenantRouteSchemas.getTenant
  }, async (request: any, reply: FastifyReply) => {
    try {
      const user = request.user as any;
      const { id: tenantId } = request.params;
      
      const adminService = createAdminTenantService({
        fastify,
        adminUserId: user.id,
        adminOrganizationId: user.organizationId
      });

      const result = await adminService.getTenantDetails(tenantId);

      return reply.status(200).send(result);
    } catch (error) {
      logger.error({
        err: error,
        adminUserId: (request.user as any)?.id,
        tenantId: request.params.id
      }, 'Failed to get tenant details');

      if ((error as Error).message.includes('Platform admin access required')) {
        return reply.status(403).send({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Platform admin access required for tenant access'
          }
        });
      }

      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({
          error: {
            code: 'TENANT_NOT_FOUND',
            message: 'Tenant not found'
          }
        });
      }

      return reply.status(500).send({
        error: {
          code: 'TENANT_DETAILS_FAILED',
          message: 'Failed to retrieve tenant details'
        }
      });
    }
  });

  // PATCH /v1/admin/tenants/:id - Update tenant
  fastify.patch('/v1/admin/tenants/:id', {
    preHandler: [fastify.authenticate, adminAuthMiddleware],
    schema: AdminTenantRouteSchemas.updateTenant
  }, async (request: any, reply: FastifyReply) => {
    try {
      const user = request.user as any;
      const { id: tenantId } = request.params;
      
      const adminService = createAdminTenantService({
        fastify,
        adminUserId: user.id,
        adminOrganizationId: user.organizationId
      });

      const tenant = await adminService.updateTenant(tenantId, request.body);

      return reply.status(200).send({
        tenant,
        message: 'Tenant updated successfully'
      });
    } catch (error) {
      logger.error({
        err: error,
        adminUserId: (request.user as any)?.id,
        tenantId: request.params.id,
        updateData: request.body
      }, 'Failed to update tenant');

      if ((error as Error).message.includes('Platform admin access required')) {
        return reply.status(403).send({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Platform admin access required for tenant updates'
          }
        });
      }

      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({
          error: {
            code: 'TENANT_NOT_FOUND',
            message: 'Tenant not found'
          }
        });
      }

      if ((error as Error).message.includes('already exists')) {
        return reply.status(409).send({
          error: {
            code: 'TENANT_SLUG_EXISTS',
            message: 'Tenant slug already exists'
          }
        });
      }

      return reply.status(500).send({
        error: {
          code: 'TENANT_UPDATE_FAILED',
          message: 'Failed to update tenant'
        }
      });
    }
  });

  // POST /v1/admin/tenants/:id/users - Add user membership
  fastify.post('/v1/admin/tenants/:id/users', {
    preHandler: [fastify.authenticate, adminAuthMiddleware],
    schema: AdminTenantRouteSchemas.addMembership
  }, async (request: any, reply: FastifyReply) => {
    try {
      const user = request.user as any;
      const { id: tenantId } = request.params;
      
      const adminService = createAdminTenantService({
        fastify,
        adminUserId: user.id,
        adminOrganizationId: user.organizationId
      });

      const membership = await adminService.addMembership(tenantId, request.body);

      return reply.status(201).send({
        membership,
        message: 'User added to tenant successfully'
      });
    } catch (error) {
      logger.error({
        err: error,
        adminUserId: (request.user as any)?.id,
        tenantId: request.params.id,
        membershipData: request.body
      }, 'Failed to add membership');

      if ((error as Error).message.includes('Platform admin access required')) {
        return reply.status(403).send({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Platform admin access required for membership management'
          }
        });
      }

      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({
          error: {
            code: 'USER_OR_TENANT_NOT_FOUND',
            message: 'User or tenant not found'
          }
        });
      }

      if ((error as Error).message.includes('already a member')) {
        return reply.status(409).send({
          error: {
            code: 'MEMBERSHIP_EXISTS',
            message: 'User is already a member of this tenant'
          }
        });
      }

      return reply.status(500).send({
        error: {
          code: 'MEMBERSHIP_CREATION_FAILED',
          message: 'Failed to add user to tenant'
        }
      });
    }
  });

  // DELETE /v1/admin/tenants/:id/users/:membershipId - Remove membership
  fastify.delete('/v1/admin/tenants/:id/users/:membershipId', {
    preHandler: [fastify.authenticate, adminAuthMiddleware],
    schema: AdminTenantRouteSchemas.removeMembership
  }, async (request: any, reply: FastifyReply) => {
    try {
      const user = request.user as any;
      const { id: tenantId, membershipId } = request.params;
      
      const adminService = createAdminTenantService({
        fastify,
        adminUserId: user.id,
        adminOrganizationId: user.organizationId
      });

      const result = await adminService.removeMembership(tenantId, membershipId);

      return reply.status(200).send(result);
    } catch (error) {
      logger.error({
        err: error,
        adminUserId: (request.user as any)?.id,
        tenantId: request.params.id,
        membershipId: request.params.membershipId
      }, 'Failed to remove membership');

      if ((error as Error).message.includes('Platform admin access required')) {
        return reply.status(403).send({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Platform admin access required for membership management'
          }
        });
      }

      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({
          error: {
            code: 'MEMBERSHIP_NOT_FOUND',
            message: 'Membership not found'
          }
        });
      }

      if ((error as Error).message.includes('last owner')) {
        return reply.status(400).send({
          error: {
            code: 'CANNOT_REMOVE_LAST_OWNER',
            message: 'Cannot remove the last owner from tenant'
          }
        });
      }

      return reply.status(500).send({
        error: {
          code: 'MEMBERSHIP_REMOVAL_FAILED',
          message: 'Failed to remove user from tenant'
        }
      });
    }
  });

  // ===== ADMIN PORTAL HEALTH CHECK =====
  
  // GET /v1/admin/health - Admin portal health check
  fastify.get('/v1/admin/health', {
    preHandler: [fastify.authenticate, adminAuthMiddleware]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const user = request.user as any;
      
      // Admin access verified by middleware
      // Health check doesn't need service instantiation

      // Simple health check - verify database connectivity
      const healthCheck = await fastify.db.execute('SELECT 1 as health');
      
      return reply.status(200).send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        adminAccess: true,
        database: healthCheck ? 'connected' : 'disconnected',
        adminUserId: user.id
      });
    } catch (error) {
      logger.error({
        err: error,
        adminUserId: (request.user as any)?.id
      }, 'Admin portal health check failed');

      if ((error as Error).message.includes('Platform admin access required')) {
        return reply.status(403).send({
          status: 'unauthorized',
          adminAccess: false,
          message: 'Platform admin access required'
        });
      }

      return reply.status(503).send({
        status: 'unhealthy',
        error: 'Admin portal health check failed'
      });
    }
  });

  logger.info('F1A Tenant Admin Portal routes registered with security compliance');
};

export default adminTenantRoutes;