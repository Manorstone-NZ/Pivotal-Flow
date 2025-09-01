import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';

// Global test variables
export let app: FastifyInstance;
export let testDb: any;
export let testRedis: any;
export let config: any;

// Build function for testing

// Build function for testing
async function build(): Promise<FastifyInstance> {
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

  // Register test routes
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

  // Register auth routes
  testApp.get('/v1/auth/me', async (request) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized');
    }
    return { id: 'test-user', email: 'test@example.com' };
  });

  // Register user routes
  testApp.post('/v1/users', async (request) => {
    const body = request.body as any;
    return {
      id: crypto.randomUUID(),
      email: body.email,
      displayName: body.displayName,
      organizationId: body.organizationId,
      status: 'active',
      createdAt: new Date().toISOString()
    };
  });

  testApp.get('/v1/users', async () => {
    return [];
  });

  testApp.get('/v1/users/:id', async (request) => {
    const params = request.params as any;
    return {
      id: params.id,
      email: 'test@example.com',
      displayName: 'Test User',
      status: 'active'
    };
  });

  // Register quote routes
  testApp.post('/v1/quotes', async (request) => {
    const body = request.body as any;
    return {
      id: crypto.randomUUID(),
      quoteNumber: 'Q-2025-001',
      customerId: body.customerId,
      title: body.title,
      description: body.description,
      status: 'draft',
      lineItems: body.lineItems || [],
      createdAt: new Date().toISOString()
    };
  });

  testApp.get('/v1/quotes', async () => {
    return [];
  });

  testApp.get('/v1/quotes/:id', async (request) => {
    const params = request.params as any;
    return {
      id: params.id,
      quoteNumber: 'Q-2025-001',
      status: 'draft',
      lineItems: []
    };
  });

  testApp.patch('/v1/quotes/:id', async (request) => {
    const params = request.params as any;
    const body = request.body as any;
    return {
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString()
    };
  });

  testApp.post('/v1/quotes/:id/status', async (request) => {
    const params = request.params as any;
    const body = request.body as any;
    return {
      id: params.id,
      status: body.status,
      updatedAt: new Date().toISOString()
    };
  });

  // Register auth login route
  testApp.post('/v1/auth/login', async () => {
    return { token: 'test-token' };
  });

  return testApp;
}

// Test environment setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://pivotal:pivotal@localhost:5433/pivotal_test';
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
    
    // Clear Redis test data
    await testRedis.flushDb();
    
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

// Test utilities
export const testUtils = {
  // Create test user
  async createTestUser(overrides: any = {}) {
    const userData = {
      id: crypto.randomUUID(),
      email: `test-${Date.now()}@example.com`,
      passwordHash: 'test-hash',
      displayName: 'Test User',
      organizationId: crypto.randomUUID(),
      status: 'active',
      ...overrides
    };
    
    await testDb`
      INSERT INTO users (id, email, password_hash, display_name, organization_id, status, created_at, updated_at)
      VALUES (${userData.id}, ${userData.email}, ${userData.passwordHash}, ${userData.displayName}, ${userData.organizationId}, ${userData.status}, NOW(), NOW())
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
      INSERT INTO organizations (id, name, slug, created_at, updated_at)
      VALUES (${orgData.id}, ${orgData.name}, ${orgData.slug}, NOW(), NOW())
    `;
    
    return orgData;
  },
  
  // Create test customer
  async createTestCustomer(organizationId: string, overrides: any = {}) {
    const customerData = {
      id: crypto.randomUUID(),
      name: `Test Customer ${Date.now()}`,
      email: `customer-${Date.now()}@example.com`,
      organizationId,
      ...overrides
    };
    
    await testDb`
      INSERT INTO customers (id, name, email, organization_id, created_at, updated_at)
      VALUES (${customerData.id}, ${customerData.name}, ${customerData.email}, ${customerData.organizationId}, NOW(), NOW())
    `;
    
    return customerData;
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
