import { describe, it, expect, beforeEach } from 'vitest';
import { testDb, testRedis, testUtils } from './setup.js';
import { QuoteService } from '../modules/quotes/service.js';

describe('Database Integration Tests', () => {
  
  describe('Database Connectivity', () => {
    it('should connect to PostgreSQL', async () => {
      const result = await testDb`SELECT 1 as test`;
      expect(result[0].test).toBe(1);
    });
    
    it('should connect to Redis', async () => {
      await testRedis.set('test', 'value');
      const value = await testRedis.get('test');
      expect(value).toBe('value');
    });
    
    it('should handle database transactions', async () => {
      const org = await testUtils.createTestOrganization();
      const user = await testUtils.createTestUser({ organizationId: org.id });
      
      // Verify data was committed
      const result = await testDb`
        SELECT * FROM users WHERE id = ${user.id}
      `;
      
      expect(result.length).toBe(1);
      expect(result[0].email).toBe(user.email);
    });
  });
  
  describe('User Service Integration', () => {
    it('should create users in database', async () => {
      const userData = {
        email: 'test@example.com',
        displayName: 'Test User',
        organizationId: crypto.randomUUID(),
        passwordHash: 'test-hash'
      };
      
      // Create user directly in database
      await testDb`
        INSERT INTO users (id, email, password_hash, display_name, organization_id, status, created_at, updated_at)
        VALUES (${crypto.randomUUID()}, ${userData.email}, ${userData.passwordHash}, ${userData.displayName}, ${userData.organizationId}, 'active', NOW(), NOW())
      `;
      
      // Verify user exists
      const result = await testDb`
        SELECT * FROM users WHERE email = ${userData.email}
      `;
      
      expect(result.length).toBe(1);
      expect(result[0].email).toBe(userData.email);
    });
    
    it('should handle user role assignments', async () => {
      const org = await testUtils.createTestOrganization();
      const user = await testUtils.createTestUser({ organizationId: org.id });
      
      // Create a role
      const roleId = crypto.randomUUID();
      await testDb`
        INSERT INTO roles (id, name, description, is_system, is_active, created_at, updated_at)
        VALUES (${roleId}, 'test-role', 'Test role', false, true, NOW(), NOW())
      `;
      
      // Assign role to user
      await testDb`
        INSERT INTO user_roles (user_id, role_id, organization_id, is_active, created_at, updated_at)
        VALUES (${user.id}, ${roleId}, ${org.id}, true, NOW(), NOW())
      `;
      
      // Verify role assignment
      const result = await testDb`
        SELECT ur.*, r.name as role_name 
        FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE ur.user_id = ${user.id}
      `;
      
      expect(result.length).toBe(1);
      expect(result[0].role_name).toBe('test-role');
    });
  });
  
  describe('Quote Service Integration', () => {
    it('should create quotes with line items', async () => {
      const org = await testUtils.createTestOrganization();
      const customer = await testUtils.createTestCustomer(org.id);
      
      // Create quote
      const quoteId = crypto.randomUUID();
      await testDb`
        INSERT INTO quotes (id, quote_number, customer_id, organization_id, title, description, status, type, currency, created_at, updated_at)
        VALUES (${quoteId}, 'Q-2025-001', ${customer.id}, ${org.id}, 'Test Quote', 'Test description', 'draft', 'project', 'NZD', NOW(), NOW())
      `;
      
      // Create line items
      const lineItemId = crypto.randomUUID();
      await testDb`
        INSERT INTO quote_line_items (id, quote_id, line_number, description, quantity, unit_price, type, created_at, updated_at)
        VALUES (${lineItemId}, ${quoteId}, 1, 'Test service', 10, 100.00, 'service', NOW(), NOW())
      `;
      
      // Verify quote and line items
      const quoteResult = await testDb`
        SELECT * FROM quotes WHERE id = ${quoteId}
      `;
      
      const lineItemsResult = await testDb`
        SELECT * FROM quote_line_items WHERE quote_id = ${quoteId}
      `;
      
      expect(quoteResult.length).toBe(1);
      expect(quoteResult[0].title).toBe('Test Quote');
      expect(lineItemsResult.length).toBe(1);
      expect(lineItemsResult[0].description).toBe('Test service');
    });
    
    it('should handle quote status transitions', async () => {
      const org = await testUtils.createTestOrganization();
      const customer = await testUtils.createTestCustomer(org.id);
      
      // Create quote
      const quoteId = crypto.randomUUID();
      await testDb`
        INSERT INTO quotes (id, quote_number, customer_id, organization_id, title, description, status, type, currency, created_at, updated_at)
        VALUES (${quoteId}, 'Q-2025-002', ${customer.id}, ${org.id}, 'Test Quote', 'Test description', 'draft', 'project', 'NZD', NOW(), NOW())
      `;
      
      // Transition to pending
      await testDb`
        UPDATE quotes SET status = 'pending', updated_at = NOW() WHERE id = ${quoteId}
      `;
      
      // Verify status change
      const result = await testDb`
        SELECT status FROM quotes WHERE id = ${quoteId}
      `;
      
      expect(result[0].status).toBe('pending');
    });
  });
  
  describe('Cache Integration', () => {
    it('should cache user data', async () => {
      const user = await testUtils.createTestUser();
      const cacheKey = `user:${user.id}`;
      
      // Set cache
      await testRedis.set(cacheKey, JSON.stringify(user), 'EX', 300);
      
      // Get from cache
      const cached = await testRedis.get(cacheKey);
      const cachedUser = JSON.parse(cached!);
      
      expect(cachedUser.id).toBe(user.id);
      expect(cachedUser.email).toBe(user.email);
    });
    
    it('should handle cache expiration', async () => {
      const cacheKey = 'test-expiration';
      
      // Set cache with short expiration
      await testRedis.set(cacheKey, 'test-value', 'EX', 1);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Check if expired
      const value = await testRedis.get(cacheKey);
      expect(value).toBeNull();
    });
    
    it('should handle cache invalidation', async () => {
      const cacheKey = 'test-invalidation';
      
      // Set cache
      await testRedis.set(cacheKey, 'test-value');
      
      // Invalidate
      await testRedis.del(cacheKey);
      
      // Check if invalidated
      const value = await testRedis.get(cacheKey);
      expect(value).toBeNull();
    });
  });
  
  describe('Data Integrity', () => {
    it('should enforce foreign key constraints', async () => {
      const invalidOrgId = crypto.randomUUID();
      
      // Try to create user with non-existent organization
      try {
        await testDb`
          INSERT INTO users (id, email, password_hash, display_name, organization_id, status, created_at, updated_at)
          VALUES (${crypto.randomUUID()}, 'test@example.com', 'hash', 'Test User', ${invalidOrgId}, 'active', NOW(), NOW())
        `;
        throw new Error('Should have failed');
      } catch (error: any) {
        expect(error.message).toContain('foreign key');
      }
    });
    
    it('should enforce unique constraints', async () => {
      const email = 'unique@example.com';
      const orgId = crypto.randomUUID();
      
      // Create first user
      await testDb`
        INSERT INTO users (id, email, password_hash, display_name, organization_id, status, created_at, updated_at)
        VALUES (${crypto.randomUUID()}, ${email}, 'hash1', 'User 1', ${orgId}, 'active', NOW(), NOW())
      `;
      
      // Try to create second user with same email
      try {
        await testDb`
          INSERT INTO users (id, email, password_hash, display_name, organization_id, status, created_at, updated_at)
          VALUES (${crypto.randomUUID()}, ${email}, 'hash2', 'User 2', ${orgId}, 'active', NOW(), NOW())
        `;
        throw new Error('Should have failed');
      } catch (error: any) {
        expect(error.message).toContain('unique');
      }
    });
    
    it('should handle soft deletes', async () => {
      const user = await testUtils.createTestUser();
      
      // Soft delete user
      await testDb`
        UPDATE users SET deleted_at = NOW() WHERE id = ${user.id}
      `;
      
      // Verify user is soft deleted
      const result = await testDb`
        SELECT * FROM users WHERE id = ${user.id} AND deleted_at IS NULL
      `;
      
      expect(result.length).toBe(0);
    });
  });
  
  describe('Performance Tests', () => {
    it('should handle bulk operations efficiently', async () => {
      const org = await testUtils.createTestOrganization();
      const startTime = Date.now();
      
      // Create 100 users
      const users = Array(100).fill(0).map((_, i) => ({
        id: crypto.randomUUID(),
        email: `bulk-${i}@example.com`,
        passwordHash: 'hash',
        displayName: `User ${i}`,
        organizationId: org.id,
        status: 'active'
      }));
      
      // Bulk insert
      for (const user of users) {
        await testDb`
          INSERT INTO users (id, email, password_hash, display_name, organization_id, status, created_at, updated_at)
          VALUES (${user.id}, ${user.email}, ${user.passwordHash}, ${user.displayName}, ${user.organizationId}, ${user.status}, NOW(), NOW())
        `;
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
      
      // Verify all users were created
      const count = await testDb`
        SELECT COUNT(*) as count FROM users WHERE organization_id = ${org.id}
      `;
      
      expect(count[0].count).toBe(100);
    });
    
    it('should handle concurrent operations', async () => {
      const org = await testUtils.createTestOrganization();
      
      // Create 10 concurrent operations
      const operations = Array(10).fill(0).map(async (_, i) => {
        const user = {
          id: crypto.randomUUID(),
          email: `concurrent-${i}@example.com`,
          passwordHash: 'hash',
          displayName: `User ${i}`,
          organizationId: org.id,
          status: 'active'
        };
        
        return testDb`
          INSERT INTO users (id, email, password_hash, display_name, organization_id, status, created_at, updated_at)
          VALUES (${user.id}, ${user.email}, ${user.passwordHash}, ${user.displayName}, ${user.organizationId}, ${user.status}, NOW(), NOW())
        `;
      });
      
      // Execute concurrently
      await Promise.all(operations);
      
      // Verify all operations completed
      const count = await testDb`
        SELECT COUNT(*) as count FROM users WHERE organization_id = ${org.id}
      `;
      
      expect(count[0].count).toBe(10);
    });
  });
});
