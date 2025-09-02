import { initializeDatabase, getDatabase } from './src/lib/db.js';
import crypto from 'crypto';

async function setupDatabase() {
  try {
    // Initialize database
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('🔧 Setting up database schema...');
    
    // Create basic tables if they don't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        domain VARCHAR(255),
        industry VARCHAR(100),
        size VARCHAR(50),
        timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        tax_id VARCHAR(100),
        street TEXT,
        suburb TEXT,
        city TEXT,
        region TEXT,
        postcode TEXT,
        country TEXT,
        phone VARCHAR(20),
        email VARCHAR(255),
        website TEXT,
        contact_extras JSONB,
        settings JSONB NOT NULL DEFAULT '{}',
        subscription_plan VARCHAR(50) NOT NULL DEFAULT 'basic',
        subscription_status VARCHAR(20) NOT NULL DEFAULT 'active',
        trial_ends_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        display_name VARCHAR(200),
        avatar_url TEXT,
        phone VARCHAR(20),
        timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
        locale VARCHAR(10) NOT NULL DEFAULT 'en-NZ',
        date_format VARCHAR(20) NOT NULL DEFAULT 'DD MMM YYYY',
        time_format VARCHAR(10) NOT NULL DEFAULT '24h',
        preferences JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        email_verified BOOLEAN NOT NULL DEFAULT false,
        email_verified_at TIMESTAMP,
        last_login_at TIMESTAMP,
        login_count INTEGER NOT NULL DEFAULT 0,
        failed_login_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TIMESTAMP,
        password_hash VARCHAR(255),
        mfa_enabled BOOLEAN NOT NULL DEFAULT false,
        mfa_secret VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_system BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(organization_id, name)
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS permissions (
        id TEXT PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(action, resource)
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, organization_id, role_id)
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id TEXT PRIMARY KEY,
        role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(role_id, permission_id)
      )
    `);
    
    console.log('✅ Database schema created successfully!');
    
    // Create test data
    console.log('🌱 Creating test data...');
    
    // Create test organization
    const orgId = crypto.randomUUID();
    await db.execute(`
      INSERT INTO organizations (id, name, slug, subscription_plan, subscription_status, settings)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [orgId, 'Test Organization', 'test-org', 'basic', 'active', '{}']);
    
    // Create test user
    const userId = crypto.randomUUID();
    await db.execute(`
      INSERT INTO users (id, email, first_name, last_name, display_name, password_hash, organization_id, status, timezone, locale, date_format, time_format, preferences, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, 'test@example.com', 'Test', 'User', 'Test User', 'hashed-password', orgId, 'active', 'UTC', 'en-NZ', 'DD MMM YYYY', '24h', '{}', '{}']);
    
    // Create test role
    const roleId = crypto.randomUUID();
    await db.execute(`
      INSERT INTO roles (id, organization_id, name, description, is_system, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [roleId, orgId, 'test-role', 'Test role for testing', false, true]);
    
    // Create test permissions
    const perm1Id = crypto.randomUUID();
    const perm2Id = crypto.randomUUID();
    await db.execute(`
      INSERT INTO permissions (id, action, resource, description, category)
      VALUES 
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?)
    `, [perm1Id, 'override_price', 'quotes', 'Can override quote prices', 'quotes', perm2Id, 'view', 'quotes', 'Can view quotes', 'quotes']);
    
    // Assign user to role
    await db.execute(`
      INSERT INTO user_roles (id, user_id, role_id, organization_id, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [crypto.randomUUID(), userId, roleId, orgId, true]);
    
    // Assign permissions to role
    await db.execute(`
      INSERT INTO role_permissions (id, role_id, permission_id)
      VALUES 
        (?, ?, ?),
        (?, ?, ?)
    `, [crypto.randomUUID(), roleId, perm1Id, crypto.randomUUID(), roleId, perm2Id]);
    
    console.log('✅ Test data created successfully!');
    console.log(`Organization ID: ${orgId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Role ID: ${roleId}`);
    console.log(`Permissions: ${perm1Id}, ${perm2Id}`);
    
  } catch (error) {
    console.error('❌ Failed to setup database:', error);
    throw error;
  }
}

setupDatabase().then(() => {
  console.log('🎉 Database setup complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Database setup failed:', error);
  process.exit(1);
});
