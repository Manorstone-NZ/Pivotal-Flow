import { initializeDatabase, getDatabase } from './src/lib/db.js';
import { users } from './src/lib/schema.js';
import { eq } from 'drizzle-orm';

async function checkUser() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('🔍 Checking for user: admin@pivotalflow.com');
    
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
        organizationId: users.organizationId,
      })
      .from(users)
      .where(eq(users.email, 'admin@pivotalflow.com'))
      .limit(1);

    if (userResult.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const user = userResult[0];
    console.log('✅ User found:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Display Name: ${user.displayName}`);
    console.log(`  Status: ${user.status}`);
    console.log(`  Organization ID: ${user.organizationId}`);
    
  } catch (error) {
    console.error('❌ Error checking user:', error);
  }
}

checkUser();
