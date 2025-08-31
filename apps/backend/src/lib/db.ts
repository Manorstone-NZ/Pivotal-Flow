import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Create postgres connection
const connectionString = process.env.DATABASE_URL || 'postgresql://pivotal:pivotal@localhost:5432/pivotal';

// Create postgres client
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
});

// Create Drizzle database instance
export const db = drizzle(client, { schema });

// Export the client for direct use if needed
export { client };

// Health check function
export async function healthCheck(): Promise<{ status: 'ok' | 'error'; message: string; latency: number }> {
  const startTime = Date.now();
  
  try {
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
