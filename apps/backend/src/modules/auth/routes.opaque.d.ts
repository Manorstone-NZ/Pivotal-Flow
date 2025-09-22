/**
 * Opaque Authentication Routes
 * New routes for opaque session authentication (feature flagged)
 * Existing JWT routes remain unchanged
 */
import type { FastifyPluginAsync } from "fastify";
/**
 * Opaque Authentication Routes
 * Only registered when AUTH_USE_OPAQUE=true
 */
export declare const opaqueAuthRoutes: FastifyPluginAsync;
export default opaqueAuthRoutes;
//# sourceMappingURL=routes.opaque.d.ts.map