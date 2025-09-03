import type { FastifyInstance } from 'fastify';
import { approvalRoutes } from './routes.js';

export async function approvalModule(fastify: FastifyInstance) {
  await fastify.register(approvalRoutes);
}

export * from './service.js';
export * from './types.js';
export * from './constants.js';
export * from './schemas.js';
