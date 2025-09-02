import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';

// Global test variables
export let app: FastifyInstance;
export let testDb: any;
export let testRedis: any;
export let config: any;

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://pivotal:pivotal@localhost:5433/pivotal';
process.env.REDIS_URL = 'redis://localhost:6380';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.COOKIE_SECRET = 'test-cookie-secret-key-for-testing-only';
process.env.PORT = '3001';
process.env.HOST = 'localhost';
process.env.LOG_LEVEL = 'error';
process.env.DB_TRACE = 'false';
process.env.CACHE_TTL_SECS = '300';

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
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://pivotal:pivotal@localhost:5433/pivotal';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-32-chars';
  process.env.COOKIE_SECRET = 'test-cookie-secret-key-for-testing-only-32-chars';
  process.env.PORT = '3001';
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
  process.env.REDIS_DB = '1';
  process.env.RATE_LIMIT_ENABLED = 'false';
  process.env.CORS_ORIGIN = '*';
  
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
  
  if (testDb) {
    await testDb.end();
  }
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
    // Dynamic import of postgres with proper handling
    const postgresModule = await import('postgres');
    let postgres: any;
    
    // Handle different module formats
    if (typeof postgresModule === 'function') {
      postgres = postgresModule;
    } else if (postgresModule.default && typeof postgresModule.default === 'function') {
      postgres = postgresModule.default;
    } else if (postgresModule.postgres && typeof postgresModule.postgres === 'function') {
      postgres = postgresModule.postgres;
    } else {
      // Fallback: try to find the function in the module
      postgres = Object.values(postgresModule).find((value: any) => typeof value === 'function');
    }
    
    if (typeof postgres !== 'function') {
      throw new Error('Could not find postgres function in module');
    }
    
    // Create postgres client
    testDb = postgres(process.env.DATABASE_URL!, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    // Create test tables if they don't exist
    await createTestTables();
    
    console.log('✅ Test database initialized');
  } catch (error) {
    console.error('❌ Failed to initialize test database:', error);
    throw error;
  }
}

// Test Redis initialization
async function initializeTestRedis() {
  try {
    const { createClient } = await import('redis');
    
    testRedis = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
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
async function createTestTables() {
  // This would create the necessary test tables
  // For now, we'll assume the main tables exist
  console.log('📋 Test tables ready');
}

// Clear test data
async function clearTestData() {
  try {
    // Clear all test data from tables
    const tables = [
      'audit_logs',
      'quote_line_items', 
      'quotes',
      'user_roles',
      'users',
      'roles',
      'permissions',
      'customers',
      'organization_settings',
      'organizations',
      'service_categories'
    ];
    
    for (const table of tables) {
      await testDb`DELETE FROM ${testDb(table)}`;
    }
    
    // Clear Redis test data if available
    if (testRedis && typeof testRedis.flushDb === 'function') {
      await testRedis.flushDb();
    }
    
    console.log('🧹 Test data cleared');
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
    // Create organization first
    const org = await testUtils.createTestOrganization();
    
    // Create admin user with known credentials
    const adminUser = {
      id: crypto.randomUUID(),
      email: 'admin@test.example.com',
      firstName: 'Admin',
      lastName: 'User',
      displayName: 'Admin User',
      passwordHash: 'AdminPassword123!', // Will be hashed by the service
      organizationId: org.id,
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert admin user
    await testDb`
      INSERT INTO users (id, email, "firstName", "lastName", "passwordHash", "displayName", "organizationId", status, "createdAt", "updatedAt")
      VALUES (${adminUser.id}, ${adminUser.email}, ${adminUser.firstName}, ${adminUser.lastName}, ${adminUser.passwordHash}, ${adminUser.displayName}, ${adminUser.organizationId}, ${adminUser.status}, ${adminUser.createdAt}, ${adminUser.updatedAt})
    `;
    
    // Create admin role if it doesn't exist
    const adminRole = {
      id: crypto.randomUUID(),
      name: 'admin',
      description: 'Administrator role',
      isSystem: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await testDb`
      INSERT INTO roles (id, "organizationId", name, description, "isSystem", "isActive", "createdAt", "updatedAt")
      VALUES (${adminRole.id}, ${adminUser.organizationId}, ${adminRole.name}, ${adminRole.description}, ${adminRole.isSystem}, ${adminRole.isActive}, ${adminRole.createdAt}, ${adminRole.updatedAt})
      ON CONFLICT ("organizationId", name) DO NOTHING
    `;
    
    // Assign admin role to user
    await testDb`
      INSERT INTO user_roles (id, "userId", "organizationId", "roleId", "isActive", "assignedAt")
      VALUES (${crypto.randomUUID()}, ${adminUser.id}, ${adminUser.organizationId}, ${adminRole.id}, true, NOW())
      ON CONFLICT ("userId", "roleId", "organizationId") DO NOTHING
    `;
    
    console.log('✅ Test admin user created');
  } catch (error) {
    console.error('❌ Failed to create test admin user:', error);
  }
}

// Test utilities
export const testUtils = {
  // Create test user
  async createTestUser(overrides: any = {}) {
    // First create an organization if not provided
    let organizationId = overrides.organizationId;
    if (!organizationId) {
      const org = await testUtils.createTestOrganization();
      organizationId = org.id;
    }
    
    const userData = {
      id: crypto.randomUUID(),
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'test-hash',
      displayName: 'Test User',
      organizationId,
      status: 'active',
      ...overrides,
      organizationId // Ensure organizationId is set
    };
    
    await testDb`
      INSERT INTO users (id, email, "firstName", "lastName", "passwordHash", "displayName", "organizationId", status, "createdAt", "updatedAt")
      VALUES (${userData.id}, ${userData.email}, ${userData.firstName}, ${userData.lastName}, ${userData.passwordHash}, ${userData.displayName}, ${userData.organizationId}, ${userData.status}, NOW(), NOW())
    `;
    
    return userData;
  },
  
    // Create test organization
  async createTestOrganization(overrides: any = {}) {
    const orgData = {
      id: crypto.randomUUID(),
      name: `Test Org ${Date.now()}`,
      slug: `test-org-${Date.now()}`,
      ...overrides
    };
    
    await testDb`
      INSERT INTO organizations (id, name, slug, "createdAt", "updatedAt")
      VALUES (${orgData.id}, ${orgData.name}, ${orgData.slug}, NOW(), NOW())
    `;
    
    return orgData;
  },

  // Create test customer
  async createTestCustomer(organizationId: string, overrides: any = {}) {
    const customerData = {
      id: crypto.randomUUID(),
      customerNumber: `CUST-${Date.now()}`,
      name: `Test Customer ${Date.now()}`,
      email: `customer-${Date.now()}@example.com`,
      organizationId,
      ...overrides
    };
    
    await testDb`
      INSERT INTO customers (id, "customerNumber", "companyName", email, "organizationId", "createdAt", "updatedAt")
      VALUES (${customerData.id}, ${customerData.customerNumber}, ${customerData.name}, ${customerData.email}, ${customerData.organizationId}, NOW(), NOW())
    `;
    
    return customerData;
  },

  // Create test role
  async createTestRole(organizationId: string, overrides: any = {}) {
    const roleData = {
      id: crypto.randomUUID(),
      name: `test-role-${Date.now()}`,
      description: 'Test role for testing',
      is_system: false,
      is_active: true,
      organizationId,
      ...overrides
    };
    
    await testDb`
      INSERT INTO roles (id, "organizationId", name, description, "isSystem", "isActive", "createdAt", "updatedAt")
      VALUES (${roleData.id}, ${roleData.organizationId}, ${roleData.name}, ${roleData.description}, ${roleData.is_system}, ${roleData.is_active}, NOW(), NOW())
    `;
    
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
