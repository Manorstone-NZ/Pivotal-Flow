/**
 * Clean Authentication Plugin (No JWT)
 * Uses Opaque tokens for user sessions and PASETO v4.public for signed links
 */
import type { FastifyInstance } from 'fastify';
export interface AuthContext {
    userId: string;
    tenantId: string;
    permissions: string[];
    roles: string[];
    tokenType: 'opaque' | 'paseto';
}
declare module 'fastify' {
    interface FastifyRequest {
        auth?: AuthContext;
    }
}
/**
 * Clean Authentication Plugin
 */
declare function authPlugin(fastify: FastifyInstance): Promise<void>;
declare const _default: typeof authPlugin;
export default _default;
//# sourceMappingURL=auth.clean.d.ts.map