/**
 * F1 Tenant Switching Routes
 * Secure tenant switching with new JWT generation
 */
import type { FastifyInstance } from 'fastify';
/**
 * POST /v1/admin/tenants/:id/switch - Switch to tenant
 * Generates new JWT with tenant context
 */
export declare function registerTenantSwitchRoute(fastify: FastifyInstance): void;
//# sourceMappingURL=routes.switch.d.ts.map