import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../service.drizzle.js';
import { getDatabase } from '../../../lib/db.js';
import { organizations, users, roles, permissions, rolePermissions, userRoles } from '../../../lib/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let testDb: any;
  
  const testOptions = {
    organizationId: `test-org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };

  beforeEach(async () => {
    // Setup real test database
    testDb = await getDatabase();
    authService = new AuthService(testDb, testOptions);

    // Setup test data
    await testDb.insert(organizations).values({
      id: testOptions.organizationId,
      name: 'Test Organization',
      slug: `test-org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await testDb.insert(users).values({
      id: testOptions.userId,
      organizationId: testOptions.organizationId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: await bcrypt.hash('testpassword', 10),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  afterEach(async () => {
    // Clean up test data
    await testDb.delete(userRoles).where(eq(userRoles.organizationId, testOptions.organizationId));
    await testDb.delete(rolePermissions).where(eq(rolePermissions.roleId, 'role-test'));
    await testDb.delete(roles).where(eq(roles.organizationId, testOptions.organizationId));
    await testDb.delete(permissions).where(eq(permissions.id, 'perm-test'));
    await testDb.delete(users).where(eq(users.organizationId, testOptions.organizationId));
    await testDb.delete(organizations).where(eq(organizations.id, testOptions.organizationId));
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      const result = await authService.authenticateUser('test@example.com', 'testpassword');

      expect(result).toBeDefined();
      expect(result.user).toMatchObject({
        id: testOptions.userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      });
      expect(result.user.passwordHash).toBeUndefined(); // Should not return password hash
    });

    it('should throw error with invalid email', async () => {
      await expect(authService.authenticateUser('invalid@example.com', 'testpassword'))
        .rejects
        .toThrow('Invalid credentials');
    });

    it('should throw error with invalid password', async () => {
      await expect(authService.authenticateUser('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      // Setup permissions
      await testDb.insert(permissions).values({
        id: 'perm-test',
        name: 'Test Permission',
        description: 'Test permission for testing',
        category: 'test',
        resource: 'test',
        action: 'read',
        createdAt: new Date()
      });

      await testDb.insert(roles).values({
        id: 'role-test',
        organizationId: testOptions.organizationId,
        name: 'Test Role',
        description: 'Test role for testing',
        isSystem: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await testDb.insert(rolePermissions).values({
        id: 'rp-test',
        roleId: 'role-test',
        permissionId: 'perm-test',
        createdAt: new Date()
      });

      await testDb.insert(userRoles).values({
        id: 'ur-test',
        userId: testOptions.userId,
        roleId: 'role-test',
        organizationId: testOptions.organizationId,
        isActive: true,
        assignedAt: new Date()
      });

      const permissions = await authService.getUserPermissions(testOptions.userId);

      expect(permissions).toHaveLength(1);
      expect(permissions[0]).toMatchObject({
        id: 'perm-test',
        name: 'Test Permission',
        category: 'test',
        resource: 'test',
        action: 'read'
      });
    });

    it('should return empty array for user without permissions', async () => {
      const permissions = await authService.getUserPermissions(testOptions.userId);
      expect(permissions).toHaveLength(0);
    });
  });

  describe('validateToken', () => {
    it('should validate valid JWT token', async () => {
      const token = authService.generateToken(testOptions.userId, testOptions.organizationId);
      const result = await authService.validateToken(token);

      expect(result).toBeDefined();
      expect(result.userId).toBe(testOptions.userId);
      expect(result.organizationId).toBe(testOptions.organizationId);
    });

    it('should throw error for invalid token', async () => {
      await expect(authService.validateToken('invalid-token'))
        .rejects
        .toThrow();
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const token = authService.generateToken(testOptions.userId, testOptions.organizationId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });
});
