import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
declare const _default: (app: import("fastify").FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>) => Promise<void>;
export default _default;
declare module 'fastify' {
    interface FastifyInstance {
        db: PostgresJsDatabase<typeof import('../lib/schema.js')>;
    }
}
//# sourceMappingURL=database.d.ts.map