/**
 * Customer Module Index
 * Main module exports and registration
 */
import { customerRoutes } from './routes.js';
/**
 * Register customer module routes
 */
export async function registerCustomerRoutes(fastify) {
    await fastify.register(customerRoutes);
}
// Export all module components
export { CustomerService } from './service.js';
export { customerRoutes } from './routes.js';
export * from './types.js';
export * from './schemas.js';
//# sourceMappingURL=index.js.map