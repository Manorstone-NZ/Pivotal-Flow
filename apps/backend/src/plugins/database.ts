import fp from 'fastify-plugin';
import { hybridDb, client } from '../lib/db.js';

export default fp(async app => {
  // Skip migrations for now to avoid database issues
  // await runMigrations();
  
  app.decorate('db', hybridDb);
  app.addHook('onClose', async () => {
    // Close the database connection
    await client.end();
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    db: typeof hybridDb;
  }
}
