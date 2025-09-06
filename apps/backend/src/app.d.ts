/**
 * App factory for testing
 * Creates a Fastify instance with minimal configuration for testing
 */
import Fastify from 'fastify';
export declare function build(options?: {
    logger?: boolean;
}): Promise<Fastify.FastifyInstance<import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, Fastify.FastifyBaseLogger, Fastify.FastifyTypeProviderDefault>>;
//# sourceMappingURL=app.d.ts.map