/**
 * Jobs module
 * Background job processing with queue, status, and retry logic
 */
import { registerJobsRoutes } from './routes.js';
/**
 * Jobs module plugin
 */
const jobsModule = async (fastify) => {
    await registerJobsRoutes(fastify);
    fastify.log.info('Jobs module registered');
};
export { jobsModule };
//# sourceMappingURL=index.js.map