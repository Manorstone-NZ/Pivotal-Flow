import { initializeDatabase, getDatabase } from './src/lib/db.js';
import { users } from './src/lib/schema.js';
import { eq } from 'drizzle-orm';

async function checkAllUsersWithEmail() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('🔍 Checking all users with email: admin@pivotalflow.com');
    
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
        organizationId: users.organizationId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, 'admin@pivotalflow.com'));

    console.log(`Found ${userResult.length} users with this email:`);
    userResult.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Display Name: ${user.displayName}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Organization ID: ${user.organizationId}`);
      console.log(`   Created At: ${user.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

checkAllUsersWithEmail();
