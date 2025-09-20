/**
 * Tenant Context Plugin
 * Handles multi-tenant data isolation at the database level
 */
import type { FastifyInstance } from 'fastify';
declare module 'fastify' {
    interface FastifyRequest {
        tenantId?: string | null;
    }
}
interface TenantContextOptions {
}
declare function tenantContextPlugin(fastify: FastifyInstance, _options: TenantContextOptions): Promise<void>;
declare module 'fastify' {
    interface FastifyInstance {
        getTenantId(request: FastifyRequest): string | null;
        requireTenantContext(request: FastifyRequest, reply: FastifyReply): string;
    }
}
declare const _default: typeof tenantContextPlugin;
export default _default;
//# sourceMappingURL=tenant-context.d.ts.map