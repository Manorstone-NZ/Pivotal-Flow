import { initializeDatabase, getClient } from './src/lib/db.js';

async function testDatabaseConnection() {
  try {
    // Initialize database
    await initializeDatabase();
    const client = getClient();
    
    console.log('🔧 Testing database connection...');
    
    // Test 1: Simple query without parameters
    const result1 = await client`SELECT 1 as test`;
    console.log('✅ Simple query result:', result1);
    
    // Test 2: Query with parameters using template literals
    const testValue = 'test-org';
    const result2 = await client`SELECT id, name, slug FROM organizations WHERE slug = ${testValue} LIMIT 1`;
    console.log('✅ Parameterized query result:', result2);
    
    // Test 3: Query with multiple parameters
    const orgId = 'test-id';
    const status = 'active';
    const result3 = await client`SELECT id, email FROM users WHERE organization_id = ${orgId} AND status = ${status} LIMIT 1`;
    console.log('✅ Multi-parameter query result:', result3);
    
    console.log('✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    throw error;
  }
}

testDatabaseConnection().then(() => {
  console.log('🎉 Database connection test complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Database connection test failed:', error);
  process.exit(1);
});
