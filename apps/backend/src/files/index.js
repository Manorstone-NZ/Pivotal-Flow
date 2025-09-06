/**
 * File storage module
 * File generation and storage with local adapter and signed URLs
 */
import { registerFileRoutes } from './routes.js';
/**
 * File storage module plugin
 */
const filesModule = async (fastify) => {
    await registerFileRoutes(fastify);
    console.log('Files module registered');
};
export { filesModule };
//# sourceMappingURL=index.js.map