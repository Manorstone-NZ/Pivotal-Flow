import { initializeDatabase, getDatabase } from './src/lib/db.js';
import { organizations, users, roles, permissions, userRoles, rolePermissions } from './src/lib/schema.js';
import { hashPassword } from '@pivotal-flow/shared/security/password.js';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';

async function createTestUser() {
  try {
    // Initialize database
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('🌱 Creating test user for performance testing...');
    
    // Create test organization
    const orgId = crypto.randomUUID();
    const orgSlug = `perf-test-org-${Date.now()}`;
    await db.insert(organizations).values({
      id: orgId,
      name: 'Performance Test Organization',
      slug: orgSlug,
      subscriptionPlan: 'basic',
      subscriptionStatus: 'active',
      settings: {},
      updatedAt: new Date()
    });
    
    // Create test user with proper password hash
    const userId = crypto.randomUUID();
    const password = 'admin123456789';
    const passwordHash = await hashPassword(password);
    
    await db.insert(users).values({
      id: userId,
      email: 'admin@pivotalflow.com',
      firstName: 'Admin',
      lastName: 'User',
      displayName: 'Admin User',
      passwordHash: passwordHash,
      organizationId: orgId,
      status: 'active',
      timezone: 'UTC',
      locale: 'en-US',
      dateFormat: 'DD MMM YYYY',
      timeFormat: '24h',
      preferences: {},
      metadata: {},
      updatedAt: new Date()
    });
    
    // Create admin role
    const roleId = crypto.randomUUID();
    await db.insert(roles).values({
      id: roleId,
      organizationId: orgId,
      name: 'admin',
      description: 'Administrator role for performance testing',
      isSystem: false,
      isActive: true,
      updatedAt: new Date()
    });
    
    // Get existing permissions or create missing ones
    const existingPermissions = await db.select().from(permissions).where(eq(permissions.resource, 'quotes'));
    const permissionMap = new Map();
    
    for (const perm of existingPermissions) {
      permissionMap.set(perm.action, perm.id);
    }
    
    // Create missing permissions
    const missingPermissions = [
      { action: 'create', name: 'Create Quotes', description: 'Can create quotes' },
      { action: 'update', name: 'Update Quotes', description: 'Can update quotes' },
      { action: 'delete', name: 'Delete Quotes', description: 'Can delete quotes' }
    ];
    
    for (const perm of missingPermissions) {
      if (!permissionMap.has(perm.action)) {
        const permId = crypto.randomUUID();
        await db.insert(permissions).values({
          id: permId,
          name: perm.name,
          description: perm.description,
          category: 'quotes',
          resource: 'quotes',
          action: perm.action
        });
        permissionMap.set(perm.action, permId);
      }
    }
    
    // Assign user to role
    await db.insert(userRoles).values({
      id: crypto.randomUUID(),
      userId: userId,
      roleId: roleId,
      organizationId: orgId,
      isActive: true
    });
    
    // Assign all quote permissions to role
    for (const [action, permId] of permissionMap) {
      await db.insert(rolePermissions).values({
        id: crypto.randomUUID(),
        roleId: roleId,
        permissionId: permId
      });
    }
    
    console.log('✅ Test user created successfully!');
    console.log(`Organization ID: ${orgId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Role ID: ${roleId}`);
    console.log(`Email: admin@pivotalflow.com`);
    console.log(`Password: admin123456789`);
    console.log('🔐 Login credentials ready for performance testing');
    
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
    throw error;
  }
}

createTestUser().then(() => {
  console.log('🎉 Test user creation complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test user creation failed:', error);
  process.exit(1);
});
