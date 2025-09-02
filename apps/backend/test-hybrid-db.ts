import { initializeDatabase, getClient, getDatabase } from './src/lib/db.js';

async function testHybridDatabase() {
  try {
    // Initialize database
    await initializeDatabase();
    const drizzleDb = getDatabase();
    const client = getClient();
    
    console.log('🔧 Testing hybrid database...');
    
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
    
    // Test 1: Simple query without parameters
    const result1 = await hybridDb.execute('SELECT 1 as test');
    console.log('✅ Simple query result:', result1);
    
    // Test 2: Query with parameters
    const testValue = 'test-org';
    const result2 = await hybridDb.execute('SELECT id, name, slug FROM organizations WHERE slug = $1 LIMIT 1', [testValue]);
    console.log('✅ Parameterized query result:', result2);
    
    // Test 3: Query with multiple parameters
    const orgId = 'test-id';
    const status = 'active';
    const result3 = await hybridDb.execute('SELECT id, email FROM users WHERE organization_id = $1 AND status = $2 LIMIT 1', [orgId, status]);
    console.log('✅ Multi-parameter query result:', result3);
    
    console.log('✅ All hybrid database tests passed!');
    
  } catch (error) {
    console.error('❌ Hybrid database test failed:', error);
    throw error;
  }
}

testHybridDatabase().then(() => {
  console.log('🎉 Hybrid database test complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Hybrid database test failed:', error);
  process.exit(1);
});
