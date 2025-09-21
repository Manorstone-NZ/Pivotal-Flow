import { Type } from '@sinclair/typebox';
import { app } from './server.js';
// Import PASETO service routes (for service-to-service and signed links)
import { pasetoServiceRoutes } from './modules/auth/routes.paseto-service.js';
// Import opaque auth routes (feature flagged)
import { opaqueAuthRoutes } from './modules/auth/routes.opaque.js';
// Import audit routes for tenant administrators
import { auditRoutes } from './modules/audit/routes.js';
// Import user route modules
import { listUsersRoute } from './modules/users/routes.list.js';
import { createUserRoute } from './modules/users/routes.create.js';
// Re-enabling core modules after F1 fixes
import { registerQuoteRoutes } from './modules/quotes/index.js';
import { registerPublicQuoteRoutes } from './modules/quotes/routes.public.js';
// import { rateCardRoutes } from './modules/rate-cards/routes.js';
// import { registerInvoiceRoutes } from './modules/invoices/index.js';
import { permissionRoutes } from './modules/permissions/routes.js';
import { currencyRoutes } from './modules/currencies/routes.js';
// import { paymentRoutes } from './modules/payments/routes.js';
// import { projectsModule } from './modules/projects/index.js';
// import { timeRoutes } from './modules/time/routes.js';
// Import customer route modules
import { registerCustomerRoutes } from './modules/customers/index.js';
// Import organization route modules
import { registerOrganizationRoutes } from './modules/organizations/index.js';
// F1: Import tenant administration route modules
import { registerTenantRoutes } from './modules/tenants/index.js';
// Import health route modules
import { healthRoutes } from './routes/health.js';
// Simple response schema for testing
const RootResponseSchema = Type.Object({
    message: Type.String(),
    timestamp: Type.String(),
    version: Type.String(),
});
export async function registerRoutes() {
    // Root endpoint with TypeBox schema
    app.get('/', {
        schema: {
            response: {
                200: RootResponseSchema,
            }
        }
    }, async () => {
        return {
            message: 'Pivotal Flow API is running',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        };
    });
    // Register PASETO service routes (for service-to-service and signed links)
    await app.register(pasetoServiceRoutes, { prefix: '/api/v1/auth' });
    // Register opaque auth routes (always enabled now)
    await app.register(opaqueAuthRoutes, { prefix: '/api/v1/auth' });
    // Register audit routes for tenant administrators
    await app.register(auditRoutes, { prefix: '/api/v1/audit' });
    // Register user route modules
    await app.register(listUsersRoute);
    await app.register(createUserRoute);
    // Re-enabling core modules after F1 fixes
    await app.register(async (fastify) => {
        registerQuoteRoutes(fastify);
    }, { prefix: '/api' });
    // Re-enable essential modules
    await app.register(permissionRoutes);
    await app.register(currencyRoutes);
    // Still disabled pending fixes:
    // await app.register(rateCardRoutes, { prefix: '/api/v1' });
    // await app.register(async (fastify) => {
    //   registerInvoiceRoutes(fastify);
    // }, { prefix: '/api' });
    // await app.register(paymentRoutes);
    // await app.register(projectsModule);
    // await app.register(timeRoutes, { prefix: '/api' });
    // Register customer route modules
    await app.register(async (fastify) => {
        registerCustomerRoutes(fastify);
    }, { prefix: '/api' });
    // Register organization route modules
    await app.register(async (fastify) => {
        registerOrganizationRoutes(fastify);
    }, { prefix: '/api' });
    // F1: Register tenant administration route modules
    await app.register(async (fastify) => {
        registerTenantRoutes(fastify);
    }, { prefix: '/api' });
    // Register health route modules
    await app.register(healthRoutes, { prefix: '/api/v1/health' });
    // Re-enable public quote routes
    await app.register(async (fastify) => {
        registerPublicQuoteRoutes(fastify);
    }, { prefix: '/api' });
}
//# sourceMappingURL=routes.js.map