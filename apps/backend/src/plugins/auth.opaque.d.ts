/**
 * Opaque Authentication Plugin
 * Implements opaque session tokens with Redis storage
 * Only registers when AUTH_USE_OPAQUE=true
 */
import type { FastifyPluginAsync } from 'fastify';
import { SessionService } from '../services/paseto.js';
import { AuthRepository } from '../repositories/auth.js';
declare module 'fastify' {
    interface FastifyInstance {
        sessionService: SessionService;
        authRepository: AuthRepository;
    }
}
/**
 * Opaque Authentication Plugin
 */
export declare const opaqueAuthPlugin: FastifyPluginAsync;
//# sourceMappingURL=auth.opaque.d.ts.map