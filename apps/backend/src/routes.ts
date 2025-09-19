import { Type } from '@sinclair/typebox';
import { app } from './server.js';

// Import auth route modules
import { loginRoute } from './modules/auth/routes.login.js';
import { refreshRoute } from './modules/auth/routes.refresh.js';
import { logoutRoute } from './modules/auth/routes.logout.js';
import { meRoute } from './modules/auth/routes.me.js';

// Import user route modules
import { listUsersRoute } from './modules/users/routes.list.js';
import { createUserRoute } from './modules/users/routes.create.js';

// Import rate card route modules
import { rateCardRoutes } from './modules/rate-cards/routes.js';

// Import quote route modules
import { registerQuoteRoutes } from './modules/quotes/index.js';

// Import invoice route modules
import { registerInvoiceRoutes } from './modules/invoices/index.js';

// Import permission route modules
import { permissionRoutes } from './modules/permissions/routes.js';

// Import currency route modules
import { currencyRoutes } from './modules/currencies/routes.js';

// Import payment route modules
import { paymentRoutes } from './modules/payments/routes.js';

// Import project route modules
import { projectsModule } from './modules/projects/index.js';

// Import time tracking route modules
import { timeRoutes } from './modules/time/routes.js';

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

  // Register auth route modules
  await app.register(loginRoute, { prefix: '/api/v1/auth' });
  await app.register(refreshRoute, { prefix: '/api/v1/auth' });
  await app.register(logoutRoute, { prefix: '/api/v1/auth' });
  await app.register(meRoute, { prefix: '/api/v1/auth' });

  // Register user route modules
  await app.register(listUsersRoute);
  await app.register(createUserRoute);

  // Register rate card route modules
  await app.register(rateCardRoutes, { prefix: '/api/v1' });

  // Register quote route modules
  await app.register(async (fastify) => {
    registerQuoteRoutes(fastify);
  }, { prefix: '/api' });

  // Register invoice route modules
  await app.register(async (fastify) => {
    registerInvoiceRoutes(fastify);
  }, { prefix: '/api' });

  // Register permission route modules
  await app.register(permissionRoutes);

  // Register currency route modules
  await app.register(currencyRoutes);

  // Register payment route modules
  await app.register(paymentRoutes);

  // Register project route modules
  await app.register(projectsModule);

  // Register time tracking route modules
  await app.register(timeRoutes, { prefix: '/api' });

  // Register health route modules
  await app.register(healthRoutes, { prefix: '/api/v1/health' });
}
