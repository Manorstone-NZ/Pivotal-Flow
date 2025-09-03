import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserService } from '../service.drizzle.js';
import { getDatabase } from '../../../lib/db.js';
import { organizations, users, roles, permissions, rolePermissions, userRoles } from '../../../lib/schema.js';
import { eq } from 'drizzle-orm';

describe('UserService', () => {
  let userService: UserService;
  let testDb: any;
  
  const testOptions = {
    organizationId: `test-org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };

  beforeEach(async () => {
    // Setup real test database
    testDb = await getDatabase();
    userService = new UserService(testDb, testOptions);

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

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'testpassword123'
      };

      const result = await userService.createUser(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.firstName).toBe(userData.firstName);
      expect(result.lastName).toBe(userData.lastName);
      expect(result.organizationId).toBe(testOptions.organizationId);
      expect(result.passwordHash).toBeUndefined(); // Should not return password hash

      // Verify it was saved to database
      const saved = await testDb.select().from(users).where(eq(users.email, userData.email));
      expect(saved).toHaveLength(1);
      expect(saved[0].email).toBe(userData.email);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com', // Already exists
        firstName: 'New',
        lastName: 'User',
        password: 'testpassword123'
      };

      await expect(userService.createUser(userData))
        .rejects
        .toThrow('User with this email already exists');
    });

    it('should throw error for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        firstName: 'New',
        lastName: 'User',
        password: 'testpassword123'
      };

      await expect(userService.createUser(userData))
        .rejects
        .toThrow();
    });
  });

  describe('getUser', () => {
    it('should return user by ID', async () => {
      const result = await userService.getUser(testOptions.userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(testOptions.userId);
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('Test');
      expect(result.lastName).toBe('User');
      expect(result.passwordHash).toBeUndefined(); // Should not return password hash
    });

    it('should return null for non-existent user', async () => {
      const result = await userService.getUser('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getUsers', () => {
    it('should return users with pagination', async () => {
      // Create additional test users
      const additionalUsers = [
        {
          id: `user-1-${Date.now()}`,
          organizationId: testOptions.organizationId,
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `user-2-${Date.now()}`,
          organizationId: testOptions.organizationId,
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await testDb.insert(users).values(additionalUsers);

      const result = await userService.getUsers({ page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.users).toHaveLength(3); // Original + 2 new users
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter users by search term', async () => {
      const result = await userService.getUsers({ page: 1, limit: 10, search: 'Test' });

      expect(result).toBeDefined();
      expect(result.users).toHaveLength(1);
      expect(result.users[0].firstName).toBe('Test');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com'
      };

      const result = await userService.updateUser(testOptions.userId, updateData);

      expect(result).toBeDefined();
      expect(result.firstName).toBe(updateData.firstName);
      expect(result.lastName).toBe(updateData.lastName);
      expect(result.email).toBe(updateData.email);

      // Verify it was updated in database
      const updated = await testDb.select().from(users).where(eq(users.id, testOptions.userId));
      expect(updated[0].firstName).toBe(updateData.firstName);
    });

    it('should throw error for non-existent user', async () => {
      const updateData = {
        firstName: 'Updated'
      };

      await expect(userService.updateUser('non-existent-id', updateData))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('addUserRole', () => {
    it('should add role to user successfully', async () => {
      // Create test role
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

      const result = await userService.addUserRole(testOptions.userId, 'role-test');

      expect(result).toBeDefined();
      expect(result.userId).toBe(testOptions.userId);
      expect(result.roleId).toBe('role-test');
      expect(result.organizationId).toBe(testOptions.organizationId);
      expect(result.isActive).toBe(true);

      // Verify it was saved to database
      const saved = await testDb.select().from(userRoles).where(eq(userRoles.userId, testOptions.userId));
      expect(saved).toHaveLength(1);
      expect(saved[0].roleId).toBe('role-test');
    });

    it('should throw error for non-existent user', async () => {
      await expect(userService.addUserRole('non-existent-id', 'role-test'))
        .rejects
        .toThrow('User not found');
    });

    it('should throw error for non-existent role', async () => {
      await expect(userService.addUserRole(testOptions.userId, 'non-existent-role'))
        .rejects
        .toThrow('Role not found');
    });
  });

  describe('removeUserRole', () => {
    it('should remove role from user successfully', async () => {
      // Create test role and assign it
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

      await testDb.insert(userRoles).values({
        id: 'ur-test',
        userId: testOptions.userId,
        roleId: 'role-test',
        organizationId: testOptions.organizationId,
        isActive: true,
        assignedAt: new Date()
      });

      const result = await userService.removeUserRole(testOptions.userId, 'role-test');

      expect(result).toBeDefined();
      expect(result.userId).toBe(testOptions.userId);
      expect(result.roleId).toBe('role-test');

      // Verify it was removed from database
      const saved = await testDb.select().from(userRoles).where(eq(userRoles.userId, testOptions.userId));
      expect(saved).toHaveLength(0);
    });

    it('should throw error for non-existent user', async () => {
      await expect(userService.removeUserRole('non-existent-id', 'role-test'))
        .rejects
        .toThrow('User not found');
    });
  });
});
