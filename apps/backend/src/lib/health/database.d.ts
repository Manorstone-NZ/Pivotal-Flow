import type { FastifyInstance } from 'fastify';
export declare function checkDatabaseHealth(fastify: FastifyInstance): Promise<{
    status: "error" | "ok";
    message: string;
    latency: number;
    timestamp: string;
}>;
//# sourceMappingURL=database.d.ts.map