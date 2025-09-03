import { initializeDatabase, getDatabase } from './src/lib/db.js';
import { users, organizations } from './src/lib/schema.js';

async function listAllUsers() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('🔍 Listing all users:');
    
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
        organizationId: users.organizationId,
      })
      .from(users);

    console.log(`Found ${userResult.length} users:`);
    userResult.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Display Name: ${user.displayName}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Organization ID: ${user.organizationId}`);
      console.log('');
    });

    console.log('🔍 Listing all organizations:');
    const orgResult = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
      })
      .from(organizations);

    console.log(`Found ${orgResult.length} organizations:`);
    orgResult.forEach((org, index) => {
      console.log(`${index + 1}. ID: ${org.id}`);
      console.log(`   Name: ${org.name}`);
      console.log(`   Slug: ${org.slug}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  }
}

listAllUsers();
