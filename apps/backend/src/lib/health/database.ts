import { getDatabaseHealth } from '@pivotal-flow/shared';
import { createDbLogger } from '../logger';

export async function checkDatabaseHealth() {
  const startTime = Date.now();
  const dbLogger = createDbLogger('health_check');
  
  try {
    dbLogger.debug('Starting database health check');
    
    // Use the shared Prisma client for health check
    const healthResult = await getDatabaseHealth();
    
    const latency = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    dbLogger.info({
      message: 'Database health check completed',
      latency,
      healthStatus: healthResult.status,
    });
    
    return {
      status: healthResult.status,
      message: healthResult.message,
      latency,
      timestamp,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    dbLogger.error({
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      latency,
    });
    
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Database health check failed',
      latency,
      timestamp,
    };
  }
}
