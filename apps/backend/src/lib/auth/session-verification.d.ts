/**
 * F2B Session Verification for Opaque Token Authentication
 * Implements secure session-based authentication replacing JWT
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
export interface AuthenticatedUser {
    userId: string;
    organizationId: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
    memberships: Array<{
        tenantId: string;
        role: string;
    }>;
}
export declare function verifySession(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function verifyPaseto(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function verifyPublicPaseto(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function registerSessionVerification(fastify: FastifyInstance): Promise<void>;
//# sourceMappingURL=session-verification.d.ts.map