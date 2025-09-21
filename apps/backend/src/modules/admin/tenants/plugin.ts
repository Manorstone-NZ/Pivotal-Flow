import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import adminTenantRoutes from './routes.js';

/**
 * Tenant Admin Plugin
 * 
 * Registers the tenant administration routes for platform admins
 * All routes require system.super_admin permission
 */
export default fp(async function tenantAdminPlugin(fastify: FastifyInstance) {
  await fastify.register(adminTenantRoutes);
}, {
  name: 'tenant-admin',
  dependencies: ['auth', 'access-control']
});
