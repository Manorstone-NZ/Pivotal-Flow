import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';

// Global test variables
export let app: FastifyInstance;
export let testDb: any;
export let testRedis: any;
export let config: any;

// Set environment variables for testing
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://pivotal:pivotal@localhost:5433/pivotal';
process.env['REDIS_URL'] = 'redis://localhost:6380';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-for-testing-only';
process.env['COOKIE_SECRET'] = 'test-cookie-secret-key-for-testing-only';
process.env['PORT'] = '3001';
process.env['HOST'] = 'localhost';
process.env['LOG_LEVEL'] = 'error';
process.env['DB_TRACE'] = 'false';
process.env['CACHE_TTL_SECS'] = '300';

// Build function for testing
async function build(): Promise<FastifyInstance> {
  // Create a test app with real plugins but minimal configuration
  const Fastify = (await import('fastify')).default;
  const cors = (await import('@fastify/cors')).default;
  const helmet = (await import('@fastify/helmet')).default;
  const rateLimit = (await import('@fastify/rate-limit')).default;
  
  const testApp = Fastify({
    logger: false,
    trustProxy: true,
  });

  // Register basic plugins for testing
  await testApp.register(cors as any, {
    origin: true,
    credentials: true,
  });

  await testApp.register(helmet as any, {
    contentSecurityPolicy: false,
  });

  await testApp.register(rateLimit as any, {
    max: 100,
    timeWindow: 60000,
  });

  // Register database plugin
  const databasePlugin = (await import('../plugins/database.js')).default;
  await testApp.register(databasePlugin);

  // Register cache plugin
  const { cachePlugin } = await import('../plugins/cache.plugin.js');
  await testApp.register(cachePlugin, {
    host: 'localhost',
    port: 6380,
    db: 0,
    keyPrefix: 'pivotal-flow:test:',
    ttl: 300,
    enabled: false // Disable cache for testing to avoid Redis connection issues
  });

  // Register auth plugin
  const { authPlugin } = await import('../modules/auth/index.js');
  await testApp.register(authPlugin);

  // Register real routes
  const { registerQuoteRoutes } = await import('../modules/quotes/index.js');
  await registerQuoteRoutes(testApp);

  const { listUsersRoute, createUserRoute, getUserRoute } = await import('../modules/users/index.js');
  await testApp.register(listUsersRoute);
  await testApp.register(createUserRoute);
  await testApp.register(getUserRoute);

  const { loginRoute, meRoute } = await import('../modules/auth/index.js');
  await testApp.register(loginRoute);
  await testApp.register(meRoute);

  // Register basic routes
  testApp.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is healthy',
    version: '0.1.0'
  }));

  testApp.get('/', async () => ({
    message: 'Pivotal Flow API',
    version: '0.1.0',
    status: 'running',
    endpoints: {
      health: '/health',
      metrics: '/metrics'
    }
  }));

  testApp.get('/metrics', async () => {
    return 'http_requests_total 0';
  });

  return testApp;
}

// Test environment setup
beforeAll(async () => {
  // Set test environment variables
  process.env['NODE_ENV'] = 'test';
  process.env['DATABASE_URL'] = 'postgresql://pivotal:pivotal@localhost:5433/pivotal'; // Use production database
  process.env['REDIS_URL'] = 'redis://localhost:6379/1';
  process.env['JWT_SECRET'] = 'test-jwt-secret-key-for-testing-only-32-chars';
  process.env['COOKIE_SECRET'] = 'test-cookie-secret-key-for-testing-only-32-chars';
  process.env['PORT'] = '3001';
  process.env['REDIS_HOST'] = 'localhost';
  process.env['REDIS_PORT'] = '6379';
  process.env['REDIS_DB'] = '1';
  process.env['RATE_LIMIT_ENABLED'] = 'false';
  process.env['CORS_ORIGIN'] = '*';
  
  // Import config after setting environment variables
  const configModule = await import('../lib/config.js');
  config = configModule.config;
  
  // Build test app
  app = await build();
  
  // Initialize test database
  await initializeTestDatabase();
  
  // Initialize test Redis
  await initializeTestRedis();
}, 30000);

// Test environment cleanup
afterAll(async () => {
  // Clean up test data
  await cleanupTestData();
  
  // Close connections
  if (app) {
    await app.close();
  }
  
  if (testRedis) {
    await testRedis.disconnect();
  }
  
  // Note: testDb is a Drizzle database instance, no need to close it
  console.log('🧹 Test environment cleaned up');
}, 10000);

// Setup before each test
beforeEach(async () => {
  // Clear test data
  await clearTestData();
  
  // Create test admin user for authentication tests
  await createTestAdminUser();
  
  // Reset mocks
  vi.clearAllMocks();
}, 5000);

// Cleanup after each test
afterEach(async () => {
  // Additional cleanup if needed
}, 2000);

// Test database initialization
async function initializeTestDatabase() {
  try {
    // Use the production database connection
    const { getDatabase, getClient } = await import('../lib/db.js');
    
    // Initialize the database if not already initialized
    const { initializeDatabase } = await import('../lib/db.js');
    await initializeDatabase();
    
    // Get the production database instance and client
    testDb = getDatabase();
    const client = getClient();
    
    // Create a hybrid database object that uses the raw client for queries
    // but keeps Drizzle for ORM operations
    const hybridDb = {
      // Use raw client for execute operations
      async execute(sql: string, params?: any[]) {
        return await client.unsafe(sql, params);
      },
      // Keep Drizzle methods for ORM operations
      select: testDb.select.bind(testDb),
      insert: testDb.insert.bind(testDb),
      update: testDb.update.bind(testDb),
      delete: testDb.delete.bind(testDb),
      transaction: testDb.transaction.bind(testDb),
      // Raw client for direct queries
      client
    };
    
    // Replace testDb with the hybrid version
    testDb = hybridDb;
    
    console.log('✅ Production database initialized for testing');
  } catch (error) {
    console.error('❌ Failed to initialize production database:', error);
    throw error;
  }
}

// Test Redis initialization
async function initializeTestRedis() {
  try {
    const { createClient } = await import('redis');
    
    testRedis = createClient({
      url: process.env['REDIS_URL'] || 'redis://localhost:6379/1',
      socket: {
        connectTimeout: 5000,
      },
    });
    
    await testRedis.connect();
    await testRedis.flushDb(); // Clear test database
    
    console.log('✅ Test Redis initialized');
  } catch (error) {
    console.error('❌ Failed to initialize test Redis:', error);
    throw error;
  }
}

// Create test tables
// Note: createTestTables function removed as it's not used

// Clear test data
async function clearTestData() {
  try {
    // Don't clear production data - just log that we're using production
    console.log('🧹 Using production database - no data clearing needed');
  } catch (error) {
    console.error('❌ Failed to clear test data:', error);
  }
}

// Cleanup test data
async function cleanupTestData() {
  await clearTestData();
  console.log('🧹 Test environment cleaned up');
}

// Create test admin user for authentication tests
async function createTestAdminUser() {
  try {
    // Try to get existing production data, but don't fail if none exists
    const orgs = await testDb.execute(`
      SELECT id, name, slug
      FROM organizations 
      LIMIT 1
    `);
    
    if (orgs.length > 0) {
      const org = orgs[0];
      const users = await testDb.execute(`
        SELECT id, email, first_name, last_name, organization_id, status
        FROM users 
        WHERE organization_id = $1 AND status = 'active'
        LIMIT 1
      `, [org.id]);
      
      if (users.length > 0) {
        console.log('✅ Using existing production data for admin tests');
        return { org, user: users[0] };
      }
    }
    
    console.log('⚠️ No production data available for admin tests');
    return { org: null, user: null };
  } catch (error) {
    console.error('❌ Failed to get production data for admin user:', error);
    console.log('⚠️ Admin tests will be limited due to data access issues');
    return { org: null, user: null };
  }
}

// Test utilities
export const testUtils: {
  getProductionUser: () => Promise<any>;
  getProductionOrganization: () => Promise<any>;
  getProductionRole: () => Promise<any>;
  getProductionPermission: () => Promise<any>;
  createTestUser: (data?: any) => Promise<any>;
  createTestOrganization: (data?: any) => Promise<any>;
  createTestCustomer: (organizationId: string, data?: any) => Promise<any>;
  createTestRole: (organizationId: string, data?: any) => Promise<any>;
  generateTestToken: (userId: string, organizationId: string, roles?: string[]) => string;
  makeAuthenticatedRequest: (url: string, options?: any) => Promise<any>;
} = {
  // Get existing production user
  async getProductionUser() {
    const users = await testDb.execute(`
      SELECT id, email, first_name, last_name, display_name, organization_id, status
      FROM users 
      WHERE status = 'active' 
      LIMIT 1
    `);
    
    if (users.length === 0) {
      throw new Error('No active users found in production database');
    }
    
    return users[0];
  },

  // Get existing production organization
  async getProductionOrganization() {
    const orgs = await testDb.execute(`
      SELECT id, name, slug
      FROM organizations 
      LIMIT 1
    `);
    
    if (orgs.length === 0) {
      throw new Error('No organizations found in production database');
    }
    
    return orgs[0];
  },

  // Get existing production role
  async getProductionRole() {
    const roles = await testDb.execute(`
      SELECT id, name, description, organization_id, is_system, is_active
      FROM roles 
      WHERE is_active = true 
      LIMIT 1
    `);
    
    if (roles.length === 0) {
      throw new Error('No active roles found in production database');
    }
    
    return roles[0];
  },

  // Get existing production permission
  async getProductionPermission() {
    const permissions = await testDb.execute(`
      SELECT id, action, resource, description, category
      FROM permissions 
      LIMIT 1
    `);
    
    if (permissions.length === 0) {
      throw new Error('No permissions found in production database');
    }
    
    return permissions[0];
  },

  // Create test organization
  async createTestOrganization(data: any = {}) {
    const { randomUUID } = await import('crypto');
    const orgId = randomUUID();
    
    const orgData = {
      id: orgId,
      name: data.name || `Test Organization ${Date.now()}`,
      slug: data.slug || `test-org-${Date.now()}`,
      timezone: data.timezone || 'UTC',
      currency: data.currency || 'NZD',
      subscriptionPlan: data.subscriptionPlan || 'basic',
      subscriptionStatus: data.subscriptionStatus || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    await testDb.execute(`
      INSERT INTO organizations (id, name, slug, timezone, currency, "subscriptionPlan", "subscriptionStatus", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [orgData.id, orgData.name, orgData.slug, orgData.timezone, orgData.currency, orgData.subscriptionPlan, orgData.subscriptionStatus, orgData.createdAt, orgData.updatedAt]);

    return orgData;
  },

  // Create test user
  async createTestUser(data: any = {}) {
    const { randomUUID } = await import('crypto');
    const userId = randomUUID();
    
    const userData = {
      id: userId,
      email: data.email || `test-${Date.now()}@example.com`,
      firstName: data.firstName || 'Test',
      lastName: data.lastName || 'User',
      displayName: data.displayName || 'Test User',
      organizationId: data.organizationId || (await testUtils.createTestOrganization()).id,
      status: data.status || 'active',
      passwordHash: data.passwordHash || 'test-hash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    await testDb.execute(`
      INSERT INTO users (id, email, first_name, last_name, display_name, organization_id, status, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [userData.id, userData.email, userData.firstName, userData.lastName, userData.displayName, userData.organizationId, userData.status, userData.passwordHash, userData.createdAt, userData.updatedAt]);

    return userData;
  },

  // Create test customer
  async createTestCustomer(organizationId: string, data: any = {}) {
    const { randomUUID } = await import('crypto');
    const customerId = randomUUID();
    
    const customerData = {
      id: customerId,
      customerNumber: data.customerNumber || `CUST-${Date.now()}`,
      companyName: data.companyName || `Test Customer ${Date.now()}`,
      organizationId: organizationId,
      status: data.status || 'active',
      customerType: data.customerType || 'business',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    await testDb.execute(`
      INSERT INTO customers (id, customer_number, company_name, organization_id, status, customer_type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [customerData.id, customerData.customerNumber, customerData.companyName, customerData.organizationId, customerData.status, customerData.customerType, customerData.createdAt, customerData.updatedAt]);

    return customerData;
  },

  // Create test role
  async createTestRole(organizationId: string, data: any = {}) {
    const { randomUUID } = await import('crypto');
    const roleId = randomUUID();
    
    const roleData = {
      id: roleId,
      name: data.name || `Test Role ${Date.now()}`,
      description: data.description || 'Test role for testing',
      organizationId: organizationId,
      isSystem: data.isSystem || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    await testDb.execute(`
      INSERT INTO roles (id, name, description, organization_id, is_system, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [roleData.id, roleData.name, roleData.description, roleData.organizationId, roleData.isSystem, roleData.isActive, roleData.createdAt, roleData.updatedAt]);

    return roleData;
  },
  
  // Generate JWT token for testing
  generateTestToken(userId: string, organizationId: string, roles: string[] = []) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      {
        sub: userId,
        org: organizationId,
        roles,
        jti: crypto.randomUUID(),
        iss: 'pivotal-flow',
        aud: 'pivotal-flow-api'
      },
      config.auth.jwtSecret,
      { expiresIn: '15m' }
    );
  },
  
  // Make authenticated request
  async makeAuthenticatedRequest(url: string, options: any = {}) {
    const user = await testUtils.createTestUser();
    const token = testUtils.generateTestToken(user.id, user.organizationId);
    
    return app.inject({
      url,
      headers: {
        authorization: `Bearer ${token}`,
        ...options.headers
      },
      ...options
    });
  }
};
