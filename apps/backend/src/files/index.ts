/**
 * File storage module
 * File generation and storage with local adapter and signed URLs
 */

import { FastifyPluginAsync } from 'fastify';
import { registerFileRoutes } from './routes.js';

/**
 * File storage module plugin
 */
const filesModule: FastifyPluginAsync = async (fastify) => {
  await registerFileRoutes(fastify);
  
  fastify.log.info('Files module registered');
};

export { filesModule };
