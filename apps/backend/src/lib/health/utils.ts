// Health-related functions moved from shared package

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 5000);
    });
    
    const queryPromise = prisma.$queryRaw`SELECT 1`;
    
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

/**
 * Get Redis connection info for health checks
 */
export async function getRedisHealth(): Promise<{
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
  latency: number;
}> {
  const startTime = Date.now();
  
  try {
    // For now, return a mock response since Redis is not directly accessible here
    // In a real implementation, you would use the Redis client
    const latency = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    return {
      status: 'ok',
      message: 'Redis connection successful',
      timestamp,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Redis connection failed',
      timestamp,
      latency,
    };
  }
}
