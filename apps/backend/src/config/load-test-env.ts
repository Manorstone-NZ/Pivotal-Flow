/**
 * Test Environment Loader
 * Loads test environment variables before normal config loading
 */

import { resolve } from 'path';

import { config } from 'dotenv';

/**
 * Load test environment variables if NODE_ENV is 'test'
 * This must be called before any config loading
 */
export function loadTestEnvironment(): void {
  // Only load test environment if NODE_ENV is explicitly set to 'test'
  if (process.env['NODE_ENV'] === 'test') {
    const testEnvPath = resolve(process.cwd(), '.env.test');
    
    try {
      // Load test environment variables
      config({ path: testEnvPath });
      console.log('✅ Test environment loaded from .env.test');
    } catch (error) {
      console.warn('⚠️  Could not load .env.test, using process.env defaults');
    }
  }
}

// Auto-load test environment when this module is imported
loadTestEnvironment();
