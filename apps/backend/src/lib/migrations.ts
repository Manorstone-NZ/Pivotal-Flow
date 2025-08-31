import { db } from './db.js';

export async function runMigrations() {
  try {
    // Create organizations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        display_name TEXT,
        password_hash TEXT,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create roles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create user_roles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        role_id UUID NOT NULL REFERENCES roles(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create audit_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        user_id UUID REFERENCES users(id),
        ip_address TEXT,
        user_agent TEXT,
        session_id TEXT,
        old_values JSONB,
        new_values JSONB,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert default organization if it doesn't exist
    await db.query(`
      INSERT INTO organizations (id, name, slug) 
      VALUES (gen_random_uuid(), 'Default Organization', 'default') 
      ON CONFLICT (slug) DO NOTHING
    `);

    // Insert default roles if they don't exist
    await db.query(`
      INSERT INTO roles (name, description) 
      VALUES 
        ('admin', 'Administrator with full access'),
        ('user', 'Regular user with limited access')
      ON CONFLICT (name) DO NOTHING
    `);

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
