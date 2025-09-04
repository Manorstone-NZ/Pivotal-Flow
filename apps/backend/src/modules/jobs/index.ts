/**
 * Jobs module
 * Background job processing with queue, status, and retry logic
 */

import { FastifyPluginAsync } from 'fastify';
import { registerJobsRoutes } from './routes.js';

/**
 * Jobs module plugin
 */
const jobsModule: FastifyPluginAsync = async (fastify) => {
  await registerJobsRoutes(fastify);
  
  fastify.log.info('Jobs module registered');
};

export { jobsModule };
