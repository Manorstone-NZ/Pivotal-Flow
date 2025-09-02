import { initializeDatabase, getClient } from './src/lib/db.js';

async function checkDatabaseSchema() {
  try {
    // Initialize database
    await initializeDatabase();
    const client = getClient();
    
    console.log('🔧 Checking database schema...');
    
    // Check organizations table
    const orgColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'organizations' 
      ORDER BY ordinal_position
    `;
    console.log('📋 Organizations table columns:');
    orgColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check users table
    const userColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    console.log('\n📋 Users table columns:');
    userColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check permissions table
    const permColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'permissions' 
      ORDER BY ordinal_position
    `;
    console.log('\n📋 Permissions table columns:');
    permColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check user_roles table
    const userRoleColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_roles' 
      ORDER BY ordinal_position
    `;
    console.log('\n📋 User_roles table columns:');
    userRoleColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check role_permissions table
    const rolePermColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'role_permissions' 
      ORDER BY ordinal_position
    `;
    console.log('\n📋 Role_permissions table columns:');
    rolePermColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    console.log('\n✅ Database schema check complete!');
    
  } catch (error) {
    console.error('❌ Database schema check failed:', error);
    throw error;
  }
}

checkDatabaseSchema().then(() => {
  console.log('🎉 Schema check complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Schema check failed:', error);
  process.exit(1);
});
