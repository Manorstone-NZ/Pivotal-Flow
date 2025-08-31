import postgres from 'postgres';
import { config } from './config.js';

// Create the connection
const connectionString = config.database.url;
const client = postgres(connectionString);

// Simple database interface
export const db = {
  client,
  async query(sql: string, params?: any[]) {
    try {
      return await client.unsafe(sql, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  async disconnect() {
    await client.end();
  }
};

// Export the client for manual queries if needed
export { client };
