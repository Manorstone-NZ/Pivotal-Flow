/**
 * F1 Tenant Switching Routes
 * Secure tenant switching with new JWT generation
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { TenantService } from './service.js';
// Temporarily remove schema imports to avoid serialization issues
// import {
//   TenantSwitchResponseSchema,
//   TenantErrorSchema,
// } from './typeboxSchemas.js';

/**
 * POST /v1/admin/tenants/:id/switch - Switch to tenant
 * Generates new JWT with tenant context
 */
export function registerTenantSwitchRoute(fastify: FastifyInstance): void {
  fastify.post('/v1/admin/tenants/:id/switch', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      // Response schemas temporarily removed for testing
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id: tenantId } = request.params as { id: string };
      const user = (request as any).user;

      if (!user?.userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
          code: 'UNAUTHORIZED',
        });
      }

      const tenantService = new TenantService();

      // 1. Verify tenant exists
      const tenant = await tenantService.getTenantById(tenantId);
      if (!tenant) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Tenant not found',
          code: 'TENANT_NOT_FOUND',
        });
      }

      // 2. Verify user has membership in target tenant
      const membership = await tenantService.getMembership(user.userId, tenantId);
      if (!membership) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'No membership found for this tenant',
          code: 'INVALID_TENANT_MEMBERSHIP',
        });
      }

      // 3. Get all user memberships for JWT
      const allMemberships = await tenantService.getUserMemberships(user.userId);

      // 4. Generate new JWT with tenant context
      const jwtPayload = {
        sub: user.userId,
        org: user.organizationId, // Legacy compatibility
        tenantId: tenantId, // F1: Current active tenant
        memberships: allMemberships.map(m => ({
          tenantId: m.tenantId,
          role: m.role,
        })),
        roles: user.roles || [], // Legacy roles
        permissions: user.permissions || [], // TODO: Get tenant-specific permissions
      };

      // 5. Sign new tokens
      const accessToken = await (fastify as any).jwt.sign(jwtPayload, { expiresIn: '15m' });
      const refreshToken = await (fastify as any).jwt.sign(
        { ...jwtPayload, type: 'refresh' }, 
        { expiresIn: '7d' }
      );

      // 6. Store refresh token (if available)
      if ((fastify as any).refreshTokenManager) {
        await (fastify as any).refreshTokenManager.store(
          user.userId,
          refreshToken,
          'refresh',
          7 * 24 * 60 * 60 // 7 days in seconds
        );
      }

      fastify.log.info({
        userId: user.userId,
        fromTenant: user.tenantId,
        toTenant: tenantId,
        membershipRole: membership.role,
      }, 'F1: Tenant switch successful');

      return reply.status(200).send({
        accessToken,
        refreshToken,
        tenant,
        membership,
      });

    } catch (error) {
      fastify.log.error({ error }, 'Failed to switch tenant');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to switch tenant',
        code: 'INTERNAL_ERROR',
      });
    }
  });
}
