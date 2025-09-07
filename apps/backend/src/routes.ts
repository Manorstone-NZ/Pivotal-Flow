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
import { quoteRoutes } from './modules/quotes/routes.js';

// Import permission route modules
import { permissionRoutes } from './modules/permissions/routes.js';

// Import currency route modules
import { currencyRoutes } from './modules/currencies/routes.js';

// Import payment route modules
import { paymentRoutes } from './modules/payments/routes.js';

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
  await app.register(loginRoute);
  await app.register(refreshRoute);
  await app.register(logoutRoute);
  await app.register(meRoute);

  // Register user route modules
  await app.register(listUsersRoute);
  await app.register(createUserRoute);

  // Register rate card route modules
  await app.register(rateCardRoutes);

  // Register quote route modules
  await app.register(quoteRoutes);

  // Register permission route modules
  await app.register(permissionRoutes);

  // Register currency route modules
  await app.register(currencyRoutes);

  // Register payment route modules
  await app.register(paymentRoutes);
}
