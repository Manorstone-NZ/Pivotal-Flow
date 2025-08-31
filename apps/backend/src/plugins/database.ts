import fp from 'fastify-plugin';
import { db } from '../lib/db.js';

export default fp(async app => {
  // Skip migrations for now to avoid database issues
  // await runMigrations();
  
  app.decorate('db', db);
  app.addHook('onClose', async () => {
    // Close the database connection
    await db.disconnect();
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    db: typeof db;
  }
}
