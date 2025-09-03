import { initializeDatabase, getDatabase } from './src/lib/db.js';
import { users } from './src/lib/schema.js';
import { eq, inArray } from 'drizzle-orm';

async function cleanupTestUsers() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('🧹 Cleaning up test users...');
    
    // Delete test users with test IDs
    const testUserIds = ['test-user-123'];
    const testOrgIds = ['test-org-123'];
    
    const deleteResult = await db
      .delete(users)
      .where(inArray(users.id, testUserIds));
    
    console.log(`✅ Deleted test users with IDs: ${testUserIds.join(', ')}`);
    
    // Keep only the most recent real user
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
        organizationId: users.organizationId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, 'admin@pivotalflow.com'))
      .orderBy(users.createdAt);

    console.log(`Found ${allUsers.length} users with admin@pivotalflow.com email:`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Display Name: ${user.displayName}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Organization ID: ${user.organizationId}`);
      console.log(`   Created At: ${user.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error cleaning up test users:', error);
  }
}

cleanupTestUsers();
