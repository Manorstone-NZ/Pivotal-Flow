import { initializeDatabase, getDatabase } from './src/lib/db.js';
import crypto from 'crypto';

async function createBasicTestData() {
  try {
    // Initialize database
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('🌱 Creating basic test data...');
    
    // Create test organization using only basic columns
    const orgId = crypto.randomUUID();
    await db.execute(`
      INSERT INTO organizations (id, name, slug)
      VALUES ($1, $2, $3)
    `, [orgId, 'Test Organization', 'test-org']);
    
    // Create test user using only basic columns
    const userId = crypto.randomUUID();
    await db.execute(`
      INSERT INTO users (id, email, first_name, last_name, organization_id, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, 'test@example.com', 'Test', 'User', orgId, 'active']);
    
    // Create test role
    const roleId = crypto.randomUUID();
    await db.execute(`
      INSERT INTO roles (id, organization_id, name, description, is_system, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [roleId, orgId, 'test-role', 'Test role for testing', false, true]);
    
    // Create test permissions
    const perm1Id = crypto.randomUUID();
    const perm2Id = crypto.randomUUID();
    await db.execute(`
      INSERT INTO permissions (id, action, resource, description, category)
      VALUES 
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10)
    `, [perm1Id, 'override_price', 'quotes', 'Can override quote prices', 'quotes', perm2Id, 'view', 'quotes', 'Can view quotes', 'quotes']);
    
    // Assign user to role
    await db.execute(`
      INSERT INTO user_roles (id, user_id, role_id, organization_id, is_active)
      VALUES ($1, $2, $3, $4, $5)
    `, [crypto.randomUUID(), userId, roleId, orgId, true]);
    
    // Assign permissions to role
    await db.execute(`
      INSERT INTO role_permissions (id, role_id, permission_id)
      VALUES 
        ($1, $2, $3),
        ($4, $5, $6)
    `, [crypto.randomUUID(), roleId, perm1Id, crypto.randomUUID(), roleId, perm2Id]);
    
    console.log('✅ Basic test data created successfully!');
    console.log(`Organization ID: ${orgId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Role ID: ${roleId}`);
    console.log(`Permissions: ${perm1Id}, ${perm2Id}`);
    
  } catch (error) {
    console.error('❌ Failed to create basic test data:', error);
    throw error;
  }
}

createBasicTestData().then(() => {
  console.log('🎉 Basic test data creation complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Basic test data creation failed:', error);
  process.exit(1);
});
