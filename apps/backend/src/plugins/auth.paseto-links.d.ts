/**
 * PASETO Links Plugin
 * Implements PASETO v4 public tokens for signed links
 * Only registers when AUTH_ENABLE_PASETO_LINKS=true
 */
import type { FastifyPluginAsync } from 'fastify';
import { PasetoKeyManager } from '../services/paseto.js';
declare module 'fastify' {
    interface FastifyInstance {
        pasetoKeyManager: PasetoKeyManager;
        generateQuoteLink: (tenantId: string, quoteId: string, expiryDays?: number) => Promise<string>;
        verifyQuoteLink: (token: string) => Promise<{
            tenantId: string;
            quoteId: string;
        } | null>;
    }
}
/**
 * PASETO Links Plugin
 */
export declare const pasetoLinksPlugin: FastifyPluginAsync;
//# sourceMappingURL=auth.paseto-links.d.ts.map