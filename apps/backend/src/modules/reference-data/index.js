/**
 * Reference data module
 * Read-only endpoints for frontend pickers with caching
 */
import { registerReferenceDataRoutes } from './routes.js';
/**
 * Reference data module plugin
 */
const referenceDataModule = async (fastify) => {
    await registerReferenceDataRoutes(fastify);
    fastify.log.info('Reference data module registered');
};
export { referenceDataModule };
//# sourceMappingURL=index.js.map