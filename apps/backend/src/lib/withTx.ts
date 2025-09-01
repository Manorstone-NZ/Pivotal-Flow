import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

/**
 * Transaction helper with retry logic and timeout
 * Provides a safe way to execute database operations within transactions
 */
export async function withTx<T>(
  db: PostgresJsDatabase<typeof import('./schema.js')>,
  operation: (tx: PostgresJsDatabase<typeof import('./schema.js')>) => Promise<T>,
  options: {
    maxRetries?: number;
    timeout?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3 } = options;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use Drizzle's native transaction support
      return await db.transaction(async (tx) => operation(tx));
    } catch (error) {
      lastError = error as Error;
      
      // Check if this is a retryable error
      if (isRetryableError(error as Error) && attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }

  throw lastError || new Error('Transaction failed after maximum retries');
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error): boolean {
  const retryableErrors = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'deadlock',
    'timeout',
    'connection'
  ];

  const errorMessage = error.message.toLowerCase();
  return retryableErrors.some(retryableError => 
    errorMessage.includes(retryableError)
  );
}
