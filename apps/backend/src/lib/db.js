import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from '../config/index.js';
import * as schema from './schema.js';
// Create postgres connection
const connectionString = config.db.DATABASE_URL;
// Database client and instance variables
let client = null;
let db = null;
let isInitialized = false;
// Database initialization function
export async function initializeDatabase() {
    if (isInitialized) {
        return;
    }
    try {
        // Dynamic import of postgres
        const postgresModule = await import('postgres');
        // Handle different module formats
        const postgres = postgresModule.default || postgresModule;
        // Create postgres client
        client = postgres(connectionString, {
            max: 10, // Maximum number of connections
            idle_timeout: 20, // Close idle connections after 20 seconds
            connect_timeout: 10, // Connection timeout
        });
        // Create Drizzle database instance
        db = drizzle(client, { schema });
        isInitialized = true;
        // eslint-disable-next-line no-console
        console.log('✅ Database initialized successfully');
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Failed to initialize database:', error);
        throw error;
    }
}
// Get database instance (throws if not initialized)
export function getDatabase() {
    if (!isInitialized || !db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}
// Get client instance (throws if not initialized)
export function getClient() {
    if (!isInitialized || !client) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return client;
}
// Create a hybrid interface for backward compatibility
export const hybridDb = {
    // Drizzle ORM methods - lazy initialization
    get select() {
        return getDatabase().select.bind(getDatabase());
    },
    get insert() {
        return getDatabase().insert.bind(getDatabase());
    },
    get update() {
        return getDatabase().update.bind(getDatabase());
    },
    get delete() {
        return getDatabase().delete.bind(getDatabase());
    },
    get execute() {
        // Drizzle doesn't have an execute method, use the client directly
        return async (sql, params) => {
            return await getClient().unsafe(sql, params);
        };
    },
    get transaction() {
        return getDatabase().transaction.bind(getDatabase());
    },
    // Raw query method for backward compatibility
    async query(sql, params) {
        try {
            return await getClient().unsafe(sql, params);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Database query error:', error);
            throw error;
        }
    },
    // Disconnect method
    async disconnect() {
        if (client) {
            await client.end();
            isInitialized = false;
        }
    }
};
// Health check function
export async function healthCheck() {
    const startTime = Date.now();
    try {
        if (!isInitialized || !client) {
            return {
                status: 'error',
                message: 'Database not initialized',
                latency: Date.now() - startTime,
            };
        }
        await client `SELECT 1`;
        const latency = Date.now() - startTime;
        return {
            status: 'ok',
            message: 'Database connection successful',
            latency,
        };
    }
    catch (error) {
        const latency = Date.now() - startTime;
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Database connection failed',
            latency,
        };
    }
}
// Check if database is ready
export function isDatabaseReady() {
    return isInitialized && !!db && !!client;
}
//# sourceMappingURL=db.js.map