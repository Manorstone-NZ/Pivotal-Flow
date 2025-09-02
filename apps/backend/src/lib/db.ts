import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

// Create postgres connection
const connectionString = process.env['DATABASE_URL'] ?? 'postgresql://pivotal:pivotal@localhost:5433/pivotal';

// Database client and instance variables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;
let isInitialized = false;

// Database initialization function
export async function initializeDatabase(): Promise<void> {
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Get database instance (throws if not initialized)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDatabase(): any {
  if (!isInitialized || !db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

// Get client instance (throws if not initialized)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClient(): any {
  if (!isInitialized || !client) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return client;
}

// Create a hybrid interface for backward compatibility
export const hybridDb = {
  // Drizzle ORM methods - lazy initialization
  get select(): unknown {
    return getDatabase().select.bind(getDatabase());
  },
  get insert(): unknown {
    return getDatabase().insert.bind(getDatabase());
  },
  get update(): unknown {
    return getDatabase().update.bind(getDatabase());
  },
  get delete(): unknown {
    return getDatabase().delete.bind(getDatabase());
  },
  get execute(): unknown {
    // Drizzle doesn't have an execute method, use the client directly
    return async (sql: string, params?: any[]) => {
      return await getClient().unsafe(sql, params);
    };
  },
  get transaction(): unknown {
    return getDatabase().transaction.bind(getDatabase());
  },
  
  // Raw query method for backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query(sql: string, params?: any[]): Promise<unknown> {
    try {
      return await getClient().unsafe(sql, params);
    } catch (error) {
              // eslint-disable-next-line no-console
        console.error('Database query error:', error);
      throw error;
    }
  },
  
  // Disconnect method
  async disconnect(): Promise<void> {
    if (client) {
      await client.end();
      isInitialized = false;
    }
  }
};

// Health check function
export async function healthCheck(): Promise<{ status: 'ok' | 'error'; message: string; latency: number }> {
  const startTime = Date.now();
  
  try {
    if (!isInitialized || !client) {
      return {
        status: 'error',
        message: 'Database not initialized',
        latency: Date.now() - startTime,
      };
    }

    await client`SELECT 1`;
    const latency = Date.now() - startTime;
    
    return {
      status: 'ok',
      message: 'Database connection successful',
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
      latency,
    };
  }
}

// Check if database is ready
export function isDatabaseReady(): boolean {
  return isInitialized && !!db && !!client;
}
