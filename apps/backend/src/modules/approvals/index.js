import { approvalRoutes } from './routes.js';
export async function approvalModule(fastify) {
    await fastify.register(approvalRoutes);
}
export * from './service.js';
export * from './types.js';
export * from './constants.js';
export * from './schemas.js';
//# sourceMappingURL=index.js.map