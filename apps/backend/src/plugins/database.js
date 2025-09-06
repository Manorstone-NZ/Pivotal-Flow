import fp from 'fastify-plugin';
import { initializeDatabase, getDatabase, getClient } from '../lib/db.js';
export default fp(async (app) => {
    try {
        // Initialize the database
        await initializeDatabase();
        // Get the initialized database instance
        const db = getDatabase();
        const client = getClient();
        // Decorate the app with the database instance
        app.decorate('db', db);
        // Add cleanup hook
        app.addHook('onClose', async () => {
            try {
                // Close the database connection
                if (client) {
                    await client.end();
                }
            }
            catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                app.log.error('Error closing database connection:', error);
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        app.log.info('✅ Database plugin registered successfully');
    }
    catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        app.log.error('❌ Failed to register database plugin:', error);
        throw error;
    }
});
//# sourceMappingURL=database.js.map