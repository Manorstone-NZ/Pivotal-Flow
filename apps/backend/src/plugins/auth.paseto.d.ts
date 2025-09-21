/**
 * PASETO Authentication Plugin
 * Replaces JWT authentication with secure PASETO + Opaque tokens
 */
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { PasetoTokenService, type SessionData } from '../lib/tokens/paseto-service.js';
export interface PasetoAuthenticatedUser {
    id: string;
    tenantId: string;
    organizationId: string;
    roles: string[];
    permissions: string[];
    memberships: Array<{
        tenantId: string;
        role: string;
    }>;
    sessionId: string;
    lastActivity: Date;
}
declare module 'fastify' {
    interface FastifyRequest {
        user: PasetoAuthenticatedUser;
        session: SessionData;
        tokenService: PasetoTokenService;
    }
    interface FastifyInstance {
        tokenService: PasetoTokenService;
        validateTenantMembership: (userId: string, tenantId: string) => Promise<boolean>;
        getTenantRole: (userId: string, tenantId: string) => Promise<string | null>;
    }
}
/**
 * PASETO Authentication Plugin
 */
export declare const pasetoAuthPlugin: FastifyPluginAsync;
/**
 * Permission checking middleware factory
 */
export declare function requirePermission(permission: string): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Tenant membership checking middleware factory
 */
export declare function requireTenantMembership(): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Role checking middleware factory
 */
export declare function requireRole(role: string): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
export default pasetoAuthPlugin;
//# sourceMappingURL=auth.paseto.d.ts.map