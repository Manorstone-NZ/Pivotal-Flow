import { allocationRoutes } from './routes.js';
export async function allocationModule(fastify) {
    await fastify.register(allocationRoutes);
}
export * from './service.js';
export * from './types.js';
export * from './constants.js';
export * from './schemas.js';
//# sourceMappingURL=index.js.map