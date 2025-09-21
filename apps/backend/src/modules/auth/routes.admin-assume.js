import { Type } from '@sinclair/typebox';
import { logger } from '../../lib/logger.js';
// TypeBox schemas (commented out unused schema)
// const AssumeTenanRequestSchema = Type.Object({
//   tenantId: Type.String(),
//   reason: Type.Optional(Type.String())
// });
const AssumeTenanResponseSchema = Type.Object({
    accessToken: Type.String(),
    refreshToken: Type.String(),
    user: Type.Object({
        id: Type.String(),
        tenantId: Type.String(),
        organizationId: Type.String(),
        roles: Type.Array(Type.String()),
        permissions: Type.Array(Type.String())
    }),
    audit: Type.Object({
        assumedAt: Type.String({ format: 'date-time' }),
        assumedBy: Type.String(),
        reason: Type.Optional(Type.String()),
        auditId: Type.String()
    })
});
/**
 * Admin "Assume Tenant" Routes
 * Allows platform administrators to assume tenant context with full audit trail
 */
export const adminAssumeRoutes = async (fastify) => {
    // Admin Assume Tenant - Server-side only tenant switching
    fastify.post('/v1/admin/tenants/:tenantId/assume', {
        preHandler: [fastify.authenticate],
        schema: {
            params: Type.Object({
                tenantId: Type.String()
            }),
            body: Type.Object({
                reason: Type.Optional(Type.String())
            }),
            response: {
                200: AssumeTenanResponseSchema
            }
        }
    }, async (request, reply) => {
        try {
            const { tenantId } = request.params;
            const { reason } = request.body;
            const adminUser = request.user;
            logger.info({
                adminUserId: adminUser.id,
                targetTenantId: tenantId,
                reason
            }, 'Admin assume tenant requested');
            // Verify admin has platform admin role
            const hasAdminRole = await verifyPlatformAdminRole(fastify, adminUser.id);
            if (!hasAdminRole) {
                return reply.status(403).send({
                    error: {
                        code: 'INSUFFICIENT_PERMISSIONS',
                        message: 'Platform admin role required for tenant assumption'
                    }
                });
            }
            // Verify target tenant exists
            const targetTenant = await verifyTenantExists(fastify, tenantId);
            if (!targetTenant) {
                return reply.status(404).send({
                    error: {
                        code: 'TENANT_NOT_FOUND',
                        message: 'Target tenant not found'
                    }
                });
            }
            // Create audit record
            const auditId = await createAssumeTenanAudit(fastify, {
                adminUserId: adminUser.id,
                targetTenantId: tenantId,
                reason: reason || 'Administrative access',
                adminTenantId: adminUser.tenantId
            });
            // Generate new PASETO tokens bound to target tenant
            const tokenService = fastify.tokenService;
            // Get user roles and permissions for target tenant
            const { roles, permissions } = await getUserRolesForTenant(fastify, adminUser.id, tenantId);
            const accessToken = await tokenService.generateAccessToken({
                sub: adminUser.id,
                org: tenantId, // Switch to target tenant
                roles,
                permissions,
                purpose: 'admin_assume',
                admin_session: true,
                original_tenant: adminUser.tenantId,
                assumed_at: Math.floor(Date.now() / 1000)
            });
            const refreshToken = await tokenService.generateRefreshToken({
                sub: adminUser.id,
                org: tenantId, // Switch to target tenant
                purpose: 'admin_assume_refresh',
                admin_session: true,
                original_tenant: adminUser.tenantId
            });
            // Create session record for the assumed tenant context
            await createAssumedTenantSession(fastify, {
                userId: adminUser.id,
                tenantId,
                originalTenantId: adminUser.tenantId,
                auditId,
                accessToken,
                refreshToken
            });
            logger.info({
                adminUserId: adminUser.id,
                targetTenantId: tenantId,
                auditId
            }, 'Admin successfully assumed tenant context');
            return reply.status(200).send({
                accessToken,
                refreshToken,
                user: {
                    id: adminUser.id,
                    tenantId,
                    organizationId: tenantId,
                    roles,
                    permissions
                },
                audit: {
                    assumedAt: new Date().toISOString(),
                    assumedBy: adminUser.id,
                    reason: reason || 'Administrative access',
                    auditId
                }
            });
        }
        catch (error) {
            logger.error({
                err: error,
                adminUserId: request.user?.id,
                targetTenantId: request.params.tenantId
            }, 'Admin assume tenant failed');
            return reply.status(500).send({
                error: {
                    code: 'ASSUME_TENANT_FAILED',
                    message: 'Failed to assume tenant context'
                }
            });
        }
    });
    // Get current assumed tenant info
    fastify.get('/v1/admin/assumed-tenant', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user;
            // Check if user is in an assumed tenant session
            if (!user.admin_session || !user.original_tenant) {
                return reply.status(200).send({
                    isAssumedSession: false
                });
            }
            return reply.status(200).send({
                isAssumedSession: true,
                currentTenantId: user.tenantId,
                originalTenantId: user.original_tenant,
                assumedAt: new Date(user.assumed_at * 1000).toISOString()
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Failed to get assumed tenant info');
            return reply.status(500).send({
                error: {
                    code: 'ASSUMED_TENANT_INFO_FAILED',
                    message: 'Failed to get assumed tenant information'
                }
            });
        }
    });
    // Return to original tenant context
    fastify.post('/v1/admin/return-to-original', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user;
            if (!user.admin_session || !user.original_tenant) {
                return reply.status(400).send({
                    error: {
                        code: 'NOT_ASSUMED_SESSION',
                        message: 'Not currently in an assumed tenant session'
                    }
                });
            }
            // Generate new tokens for original tenant
            const tokenService = fastify.tokenService;
            const { roles, permissions } = await getUserRolesForTenant(fastify, user.id, user.original_tenant);
            const accessToken = await tokenService.generateAccessToken({
                sub: user.id,
                org: user.original_tenant,
                roles,
                permissions,
                purpose: 'return_to_original'
            });
            const refreshToken = await tokenService.generateRefreshToken({
                sub: user.id,
                org: user.original_tenant,
                purpose: 'refresh'
            });
            // Revoke assumed tenant session
            await revokeAssumedTenantSession(fastify, user.id, user.tenantId);
            logger.info({
                userId: user.id,
                originalTenantId: user.original_tenant,
                assumedTenantId: user.tenantId
            }, 'Admin returned to original tenant context');
            return reply.status(200).send({
                accessToken,
                refreshToken,
                returnedToTenant: user.original_tenant
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Failed to return to original tenant');
            return reply.status(500).send({
                error: {
                    code: 'RETURN_TO_ORIGINAL_FAILED',
                    message: 'Failed to return to original tenant context'
                }
            });
        }
    });
};
// Helper functions
async function verifyPlatformAdminRole(_fastify, _userId) {
    // TODO: Implement proper platform admin role verification
    // For now, return true for development
    return true;
}
async function verifyTenantExists(fastify, tenantId) {
    const { tenants } = await import('../../lib/schema.js');
    const { eq } = await import('drizzle-orm');
    const result = await fastify.db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    return result.length > 0;
}
async function createAssumeTenanAudit(fastify, data) {
    const { auditLogs } = await import('../../lib/schema.js');
    const { generateId } = await import('@pivotal-flow/shared');
    const auditId = generateId();
    await fastify.db.insert(auditLogs).values({
        id: auditId,
        entityType: 'tenant_assumption',
        entityId: data.targetTenantId,
        action: 'assume_tenant',
        actorId: data.adminUserId,
        tenantId: data.adminTenantId,
        newValues: {
            targetTenantId: data.targetTenantId,
            reason: data.reason,
            assumedAt: new Date().toISOString()
        },
        ipAddress: '0.0.0.0', // TODO: Get from request
        userAgent: 'Admin Console' // TODO: Get from request
    });
    return auditId;
}
async function getUserRolesForTenant(_fastify, _userId, _tenantId) {
    // TODO: Implement proper role/permission lookup for tenant
    // For now, return admin permissions
    return {
        roles: ['admin'],
        permissions: ['*']
    };
}
async function createAssumedTenantSession(_fastify, data) {
    // TODO: Create session record in sessions table
    logger.debug(data, 'Created assumed tenant session');
}
async function revokeAssumedTenantSession(_fastify, userId, assumedTenantId) {
    // TODO: Revoke session records
    logger.debug({ userId, assumedTenantId }, 'Revoked assumed tenant session');
}
//# sourceMappingURL=routes.admin-assume.js.map