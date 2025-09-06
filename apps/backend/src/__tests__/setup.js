// Load test environment FIRST before any other imports
import '../config/load-test-env.js';
import { getRedisClient } from '@pivotal-flow/shared/redis.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { config } from '../config/index.js';
import { getDatabase, getClient, initializeDatabase } from '../lib/db.js';
import { organizations, users, customers, quotes, quoteLineItems, roles, userRoles } from '../lib/schema.js';
// Test database and Redis clients
let testDb;
let testRedis;
let app;
let testConfig;
// Test utilities
const testUtils = {
    generateId() {
        return crypto.randomUUID();
    },
    async createTestOrganization(data = {}) {
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
    async createTestUser(data = {}) {
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
    async createTestCustomer(organizationId, data = {}) {
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
    async createTestRole(organizationId, data = {}) {
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
    generateTestToken(userId, organizationId, permissions = []) {
        return jwt.sign({
            userId,
            organizationId,
            permissions,
            type: 'access'
        }, testConfig.auth.jwtSecret, { expiresIn: '15m' });
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
        }
        catch (error) {
            // Ignore cleanup errors in test environment
            console.log('Cleanup error (expected in test environment):', error.message);
        }
    }
};
// Setup and teardown
beforeAll(async () => {
    try {
        // Test environment is loaded via load-test-env.js import
        // Config is already loaded from the centralized module
        testConfig = config;
        // Initialize database
        await initializeDatabase();
        testDb = getDatabase();
        // Initialize test Redis
        testRedis = getRedisClient();
        console.log('✅ Test environment initialized successfully');
    }
    catch (error) {
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
    }
    catch (error) {
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
        expect(testConfig.server.NODE_ENV).toBe('test');
    });
    it('should have database connection', async () => {
        try {
            const result = await testDb.execute('SELECT 1 as test');
            expect(result[0].test).toBe(1);
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('Redis connection test failed:', error);
            throw error;
        }
    });
});
//# sourceMappingURL=setup.js.map