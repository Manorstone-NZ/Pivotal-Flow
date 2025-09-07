import { app } from './server.js';
import { config } from './config/index.js';
// Route imports
import { authPlugin, loginRoute, refreshRoute, logoutRoute, meRoute } from './modules/auth/index.js';
import { listUsersRoute, createUserRoute, getUserRoute, updateUserRoute, assignRoleRoute, removeRoleRoute, updateUserStatusRoute } from './modules/users/index.js';
import { registerQuoteRoutes } from './modules/quotes/index.js';
import { rateCardRoutes } from './modules/rate-cards/index.js';
import { permissionRoutes } from './modules/permissions/index.js';
import { currencyRoutes } from './modules/currencies/routes.js';
import { paymentRoutes } from './modules/payments/routes.js';
import { metricsRoutes } from './routes/metrics.js';
import { performanceRoutes } from './routes/perf.js';
export async function registerRoutes() {
    // Authentication plugin
    await app.register(authPlugin);
    // Register authentication routes
    await app.register(loginRoute, { prefix: '/v1/auth' });
    await app.register(refreshRoute, { prefix: '/v1/auth' });
    await app.register(logoutRoute, { prefix: '/v1/auth' });
    await app.register(meRoute, { prefix: '/v1/auth' });
    // Register user management routes
    await app.register(listUsersRoute, { prefix: '/v1/users' });
    await app.register(createUserRoute, { prefix: '/v1/users' });
    await app.register(getUserRoute, { prefix: '/v1/users' });
    await app.register(updateUserRoute, { prefix: '/v1/users' });
    await app.register(assignRoleRoute, { prefix: '/v1/users' });
    await app.register(removeRoleRoute, { prefix: '/v1/users' });
    await app.register(updateUserStatusRoute, { prefix: '/v1/users' });
    // Register business logic routes
    registerQuoteRoutes(app);
    await app.register(rateCardRoutes, { prefix: '/v1' });
    await app.register(permissionRoutes, { prefix: '/v1' });
    await app.register(currencyRoutes, { prefix: '/v1' });
    await app.register(paymentRoutes, { prefix: '/v1' });
    // Register system routes
    await app.register(metricsRoutes, { prefix: '/v1' });
    await app.register(performanceRoutes, { prefix: '/v1' });
    // Root endpoint
    app.get('/', async () => {
        return {
            message: 'Pivotal Flow API',
            version: '0.1.0',
            status: 'running',
            endpoints: {
                health: '/health',
                metrics: '/metrics',
                docs: '/docs',
                openapi: '/api/openapi.json',
                auth: '/v1/auth',
                users: '/v1/users',
                quotes: '/v1/quotes',
                rateCards: '/v1/rate-cards',
                permissions: '/v1/permissions',
                currencies: '/v1/currencies',
                payments: '/v1/payments'
            }
        };
    });
    // Database health check
    app.get('/health/db', async (req, reply) => {
        try {
            // Use Drizzle health check instead of Prisma
            await req.server.db.query `SELECT 1`;
            return reply.send({ status: "ok" });
        }
        catch {
            return reply.code(500).send({ status: "db_error" });
        }
    });
    // Top-level metrics endpoint (gated by config)
    app.get('/metrics/info', async () => {
        return {
            enabled: config.metrics.METRICS_ENABLED,
            path: config.metrics.METRICS_PATH,
            defaultMetrics: true,
            customMetrics: [],
        };
    });
}
//# sourceMappingURL=routes.js.map