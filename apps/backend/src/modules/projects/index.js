import { projectRoutes } from './routes.js';
export async function projectsModule(fastify) {
    await fastify.register(projectRoutes);
}
//# sourceMappingURL=index.js.map