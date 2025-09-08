import type { FastifyInstance } from 'fastify';
import { projectRoutes } from './routes.js';

export async function projectsModule(fastify: FastifyInstance): Promise<void> {
  await fastify.register(projectRoutes);
}

