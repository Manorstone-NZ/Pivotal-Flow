import { initializeDatabase, getClient, getDatabase } from './src/lib/db.js';
import crypto from 'crypto';

async function createTestDataWithHybridDb() {
  try {
    // Initialize database
    await initializeDatabase();
    const drizzleDb = getDatabase();
    const client = getClient();
    
    console.log('🌱 Creating test data with hybrid database...');
    
    // Create hybrid database object
    const hybridDb = {
      // Use raw client for execute operations
      async execute(sql: string, params?: any[]) {
        return await client.unsafe(sql, params);
      },
      // Keep Drizzle methods for ORM operations
      select: drizzleDb.select.bind(drizzleDb),
      insert: drizzleDb.insert.bind(drizzleDb),
      update: drizzleDb.update.bind(drizzleDb),
      delete: drizzleDb.delete.bind(drizzleDb),
      transaction: drizzleDb.transaction.bind(drizzleDb),
      // Raw client for direct queries
      client
    };
    
    // Create test organization
    const orgId = crypto.randomUUID();
    const orgSlug = `test-org-${Date.now()}`;
    await hybridDb.execute(`
      INSERT INTO organizations (id, name, slug, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
    `, [orgId, 'Test Organization', orgSlug]);
    
    // Create test user
    const userId = crypto.randomUUID();
    await hybridDb.execute(`
      INSERT INTO users (id, email, first_name, last_name, organization_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, [userId, 'test@example.com', 'Test', 'User', orgId, 'active']);
    
    // Create test role
    const roleId = crypto.randomUUID();
    await hybridDb.execute(`
      INSERT INTO roles (id, organization_id, name, description, is_system, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, [roleId, orgId, 'test-role', 'Test role for testing', false, true]);
    
    // Create test permissions
    const perm1Id = crypto.randomUUID();
    const perm2Id = crypto.randomUUID();
    await hybridDb.execute(`
      INSERT INTO permissions (id, name, description, category, resource, action, "createdAt")
      VALUES 
        ($1, $2, $3, $4, $5, $6, NOW()),
        ($7, $8, $9, $10, $11, $12, NOW())
    `, [perm1Id, 'Override Quote Price', 'Can override quote prices', 'quotes', 'quotes', 'override_price', perm2Id, 'View Quotes', 'Can view quotes', 'quotes', 'quotes', 'view']);
    
    // Assign user to role
    await hybridDb.execute(`
      INSERT INTO user_roles (id, user_id, role_id, organization_id, is_active, assigned_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [crypto.randomUUID(), userId, roleId, orgId, true]);
    
    // Assign permissions to role
    await hybridDb.execute(`
      INSERT INTO role_permissions (id, role_id, permission_id, created_at)
      VALUES 
        ($1, $2, $3, NOW()),
        ($4, $5, $6, NOW())
    `, [crypto.randomUUID(), roleId, perm1Id, crypto.randomUUID(), roleId, perm2Id]);
    
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

createTestDataWithHybridDb().then(() => {
  console.log('🎉 Test data creation complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test data creation failed:', error);
  process.exit(1);
});
