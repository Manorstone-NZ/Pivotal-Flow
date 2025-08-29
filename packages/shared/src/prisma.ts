import { PrismaClient } from '@prisma/client';

// Global Prisma client instance
let prisma: PrismaClient | null = null;

/**
 * Get or create the Prisma client instance
 * Ensures only one instance exists across the application
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env['NODE_ENV'] === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      errorFormat: 'pretty',
    });
  }
  return prisma;
}

/**
 * Close the Prisma client connection
 * Should be called during application shutdown
 */
export async function closePrismaClient(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

/**
 * Test database connectivity
 * Returns true if connection is successful, false otherwise
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Get database connection info for health checks
 */
export async function getDatabaseHealth(): Promise<{
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
  latency: number;
}> {
  const startTime = Date.now();
  
  try {
    const client = getPrismaClient();
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 5000);
    });
    
    const queryPromise = client.$queryRaw`SELECT 1`;
    
    await Promise.race([queryPromise, timeoutPromise]);
    
    const latency = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    return {
      status: 'ok',
      message: 'Database connection successful',
      timestamp,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
      timestamp,
      latency,
    };
  }
}

// Export the Prisma client for direct use if needed
export { PrismaClient };
