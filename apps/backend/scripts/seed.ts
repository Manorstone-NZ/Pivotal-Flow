#!/usr/bin/env tsx

/**
 * Basic Database Seeding Script
 * 
 * This script seeds the database with minimal essential data for development and testing.
 * 
 * Usage:
 *   pnpm run db:seed
 *   pnpm run db:seed -- --reset  # Reset and reseed
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { organizations, users } from '../src/lib/schema.js';

// Database connection
const connectionString = process.env['DATABASE_URL'] || 'postgresql://pivotal:pivotal@localhost:5433/pivotal';
const sql = postgres(connectionString);
const db = drizzle(sql);

async function seedDatabase() {
  console.log('🌱 Starting basic database seeding...');
  
  try {
    // Check if we should reset first
    const shouldReset = process.argv.includes('--reset');
    if (shouldReset) {
      console.log('🔄 Resetting database...');
      await resetDatabase();
    }

    // Seed basic organization
    console.log('🏢 Seeding organization...');
    const orgData = {
      id: 'org-pivotal-flow',
      name: 'Pivotal Flow Ltd',
      slug: 'pivotal-flow',
      domain: 'pivotalflow.com',
      industry: 'Software Development',
      size: 'Small',
      timezone: 'Pacific/Auckland',
      currency: 'NZD',
      taxId: '123-456-789',
      street: '123 Queen Street',
      suburb: 'Auckland Central',
      city: 'Auckland',
      region: 'Auckland',
      postcode: '1010',
      country: 'New Zealand',
      phone: '+64 9 123 4567',
      email: 'hello@pivotalflow.com',
      website: 'https://pivotalflow.com',
      contactExtras: { linkedin: 'https://linkedin.com/company/pivotal-flow' },
      settings: { theme: 'light', notifications: true },
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(organizations).values(orgData).onConflictDoNothing();

    // Seed basic user
    console.log('👤 Seeding user...');
    const userData = {
      id: 'user-admin',
      email: 'admin@pivotalflow.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890123456789012345678901234567890',
      isActive: true,
      emailVerified: true,
      locale: 'en-NZ',
      timezone: 'Pacific/Auckland',
      dateFormat: 'DD MMM YYYY',
      timeFormat: '24h',
      organizationId: 'org-pivotal-flow',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(users).values(userData).onConflictDoNothing();

    console.log('✅ Basic database seeding completed successfully!');
    console.log('\n📋 Seeded data summary:');
    console.log(`   • 1 organization (Pivotal Flow Ltd)`);
    console.log(`   • 1 user (admin@pivotalflow.com)`);

    console.log('\n🔑 Test credentials:');
    console.log('   • admin@pivotalflow.com');
    console.log('   • Password: password123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

async function resetDatabase() {
  // Delete in reverse dependency order
  const tables = [
    'users', 'organizations'
  ];

  for (const table of tables) {
    await sql`DELETE FROM ${sql(table)}`;
  }
  
  console.log('🗑️ Database reset completed');
}

// Run seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase, resetDatabase };