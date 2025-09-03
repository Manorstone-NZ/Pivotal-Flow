import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { getDatabase, getClient, initializeDatabase } from '../lib/db.js';
import { getRedisClient } from '@pivotal-flow/shared/redis.js';
import { organizations, users, customers, quotes, quoteLineItems, roles, userRoles } from '../lib/schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Test database and Redis clients
let testDb: any;
let testRedis: any;
let app: FastifyInstance;
let config: any;

// Test utilities
const testUtils = {
  generateId(): string {
    return crypto.randomUUID();
  },

  async createTestOrganization(data: Partial<typeof organizations.$inferInsert> = {}) {
    const orgData = {
      id: this.generateId(),
      name: `Test Org ${Date.now()}`,
      slug: `test-org-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    
    const [org] = await testDb.insert(organizations).values(orgData).returning();
    return org;
  },

  async createTestUser(data: Partial<typeof users.$inferInsert> = {}) {
    const userData = {
      id: this.generateId(),
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashed-password',
      organizationId: data.organizationId || 'org-1', // Use provided org ID or default
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    
    const [user] = await testDb.insert(users).values(userData).returning();
    return user;
  },

  async createTestCustomer(organizationId: string, data: Partial<typeof customers.$inferInsert> = {}) {
    const customerData = {
      id: this.generateId(),
      name: `Test Customer ${Date.now()}`,
      email: `customer-${Date.now()}@example.com`,
      organizationId,
      customerNumber: `CUST-${Date.now()}`,
      companyName: `Test Company ${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    
    const [customer] = await testDb.insert(customers).values(customerData).returning();
    return customer;
  },

  async createTestRole(organizationId: string, data: Partial<typeof roles.$inferInsert> = {}) {
    const roleData = {
      id: this.generateId(),
      name: `Test Role ${Date.now()}`,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    
    const [role] = await testDb.insert(roles).values(roleData).returning();
    return role;
  },

  generateTestToken(userId: string, organizationId: string, permissions: string[] = []) {
    return jwt.sign(
      { 
        userId, 
        organizationId, 
        permissions,
        type: 'access'
      },
      config.auth.jwtSecret,
      { expiresIn: '15m' }
    );
  },

  async cleanupTestData() {
    try {
      // Clean up test data in reverse dependency order
      await testDb.delete(quoteLineItems).where(eq(quoteLineItems.quoteId, 'test-quote-id'));
      await testDb.delete(quotes).where(eq(quotes.id, 'test-quote-id'));
      await testDb.delete(userRoles).where(eq(userRoles.userId, 'test-user-id'));
      await testDb.delete(users).where(eq(users.id, 'test-user-id'));
      await testDb.delete(customers).where(eq(customers.organizationId, 'test-org-id'));
      await testDb.delete(roles).where(eq(roles.organizationId, 'test-org-id'));
      await testDb.delete(organizations).where(eq(organizations.id, 'test-org-id'));
    } catch (error) {
      // Ignore cleanup errors in test environment
      console.log('Cleanup error (expected in test environment):', (error as Error).message);
    }
  }
};

// Setup and teardown
beforeAll(async () => {
  // Set test environment variables
  process.env['NODE_ENV'] = 'test';
  process.env['DATABASE_URL'] = 'postgresql://pivotal:pivotal@localhost:5433/pivotal_test';
  process.env['REDIS_URL'] = 'redis://localhost:6379';
  process.env['REDIS_HOST'] = 'localhost';
  process.env['REDIS_PORT'] = '6379';
  process.env['REDIS_PASSWORD'] = '';
  process.env['REDIS_DB'] = '1';
  process.env['JWT_SECRET'] = 'test-jwt-secret-key-that-is-at-least-32-characters-long';
  process.env['JWT_ACCESS_TTL'] = '15m';
  process.env['JWT_REFRESH_TTL'] = '7d';
  process.env['COOKIE_SECRET'] = 'test-cookie-secret-key-that-is-at-least-32-characters-long';
  process.env['COOKIE_SECURE'] = 'false';
  process.env['PORT'] = '3001';
  process.env['HOST'] = 'localhost';
  process.env['RATE_LIMIT_ENABLED'] = 'false';
  process.env['RATE_LIMIT_MAX'] = '1000';
  process.env['RATE_LIMIT_WINDOW'] = '900000';
  process.env['RATE_LIMIT_UNAUTH_MAX'] = '1000';
  process.env['RATE_LIMIT_AUTH_MAX'] = '5000';
  process.env['RATE_LIMIT_ADMIN_MAX'] = '10000';
  process.env['RATE_LIMIT_LOGIN_MAX'] = '100';
  process.env['CORS_ORIGIN'] = 'http://localhost:5173';
  process.env['LOG_LEVEL'] = 'error';
  process.env['LOG_PRETTY'] = 'false';
  process.env['METRICS_ENABLED'] = 'false';
  process.env['METRICS_PORT'] = '9091';
  process.env['METRICS_PATH'] = '/metrics';
  
  try {
    // Load config after environment variables are set
    const { config: configModule } = await import('../lib/config.js');
    config = configModule;
    
    // Initialize database
    await initializeDatabase();
    testDb = getDatabase();
    
    // Initialize test Redis
    testRedis = getRedisClient();
    
    console.log('✅ Test environment initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize test environment:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Cleanup
    if (testRedis) {
      await testRedis.quit();
    }
    const client = getClient();
    if (client) {
      await client.end();
    }
    console.log('🧹 Test environment cleaned up');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
});

beforeEach(async () => {
  // Clear test data before each test
  await testUtils.cleanupTestData();
});

afterEach(async () => {
  // Clear test data after each test
  await testUtils.cleanupTestData();
});

// Export utilities for tests
export { app, testDb, testRedis, testUtils };

// Basic test to verify setup
describe('Test Setup', () => {
  it('should have proper test environment', () => {
    expect(process.env['NODE_ENV']).toBe('test');
  });

  it('should have database connection', async () => {
    try {
      const result = await testDb.execute('SELECT 1 as test');
      expect(result[0].test).toBe(1);
    } catch (error) {
      console.error('Database connection test failed:', error);
      throw error;
    }
  });

  it('should have Redis connection', async () => {
    try {
      await testRedis.set('test', 'value');
      const value = await testRedis.get('test');
      expect(value).toBe('value');
      await testRedis.del('test');
    } catch (error) {
      console.error('Redis connection test failed:', error);
      throw error;
    }
  });
});
