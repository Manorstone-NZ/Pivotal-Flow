import fp from 'fastify-plugin';
import { db, client } from '../lib/db.js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export default fp(async app => {
  // Skip migrations for now to avoid database issues
  // await runMigrations();
  
  app.decorate('db', db);
  app.addHook('onClose', async () => {
    // Close the database connection
    await client.end();
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    db: PostgresJsDatabase<typeof import('../lib/schema.js')>;
  }
}
