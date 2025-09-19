import type { FastifyInstance } from 'fastify';
/**
 * Register invoice list route
 */
export declare function registerListInvoicesRoute(fastify: FastifyInstance): void;
/**
 * Register get invoice route with ETag support
 */
export declare function registerGetInvoiceRoute(fastify: FastifyInstance): void;
/**
 * Register create invoice route
 */
export declare function registerCreateInvoiceRoute(fastify: FastifyInstance): void;
/**
 * Register update invoice route
 */
export declare function registerUpdateInvoiceRoute(fastify: FastifyInstance): void;
/**
 * Register invoice status transition route
 */
export declare function registerInvoiceStatusRoute(fastify: FastifyInstance): void;
/**
 * Register mark invoice paid route
 */
export declare function registerMarkInvoicePaidRoute(fastify: FastifyInstance): void;
/**
 * Register void invoice route
 */
export declare function registerVoidInvoiceRoute(fastify: FastifyInstance): void;
//# sourceMappingURL=routes.d.ts.map