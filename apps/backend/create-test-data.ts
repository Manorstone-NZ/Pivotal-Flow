import { initializeDatabase, getDatabase } from './src/lib/db.js';
import { organizations, users, roles, permissions, userRoles, rolePermissions } from './src/lib/schema.js';
import crypto from 'crypto';

async function createTestData() {
  try {
    // Initialize database
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('🌱 Creating test data...');
    
    // Create test organization
    const orgId = crypto.randomUUID();
    await db.insert(organizations).values({
      id: orgId,
      name: 'Test Organization',
      slug: 'test-org',
      settings: {}
    });
    
    // Create test user
    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      displayName: 'Test User',
      passwordHash: 'hashed-password',
      organizationId: orgId,
      status: 'active',
      timezone: 'UTC',
      locale: 'en-NZ',
      dateFormat: 'DD MMM YYYY',
      timeFormat: '24h',
      preferences: {},
      metadata: {}
    });
    
    // Create test role
    const roleId = crypto.randomUUID();
    await db.insert(roles).values({
      id: roleId,
      organizationId: orgId,
      name: 'test-role',
      description: 'Test role for testing',
      isSystem: false,
      isActive: true
    });
    
    // Create test permissions
    const perm1Id = crypto.randomUUID();
    const perm2Id = crypto.randomUUID();
    await db.insert(permissions).values([
      {
        id: perm1Id,
        action: 'override_price',
        resource: 'quotes',
        description: 'Can override quote prices',
        category: 'quotes'
      },
      {
        id: perm2Id,
        action: 'view',
        resource: 'quotes',
        description: 'Can view quotes',
        category: 'quotes'
      }
    ]);
    
    // Assign user to role
    await db.insert(userRoles).values({
      id: crypto.randomUUID(),
      userId: userId,
      roleId: roleId,
      organizationId: orgId,
      isActive: true
    });
    
    // Assign permissions to role
    await db.insert(rolePermissions).values([
      {
        id: crypto.randomUUID(),
        roleId: roleId,
        permissionId: perm1Id
      },
      {
        id: crypto.randomUUID(),
        roleId: roleId,
        permissionId: perm2Id
      }
    ]);
    
    console.log('✅ Test data created successfully!');
    console.log(`Organization ID: ${orgId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Role ID: ${roleId}`);
    console.log(`Permissions: ${perm1Id}, ${perm2Id}`);
    
  } catch (error) {
    console.error('❌ Failed to create test data:', error);
    throw error;
  }
}

createTestData().then(() => {
  console.log('🎉 Test data creation complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test data creation failed:', error);
  process.exit(1);
});
