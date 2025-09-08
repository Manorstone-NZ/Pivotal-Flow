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
import { hash } from '@pivotal-flow/shared';
import { organizations, users, roles, userRoles, projects } from '../src/lib/schema.js';

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
      passwordHash: await hash('password123!extra', 10),
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

    // Create admin role
    const roleData = {
      id: 'admin-role-1',
      organizationId: orgData.id,
      name: 'admin',
      description: 'Administrator role with full access',
      isSystem: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(roles).values(roleData).onConflictDoNothing();

    // Assign admin role to user
    const userRoleData = {
      id: 'user-role-1',
      userId: userData.id,
      roleId: roleData.id,
      organizationId: orgData.id,
      assignedAt: new Date(),
      isActive: true,
    };

    await db.insert(userRoles).values(userRoleData).onConflictDoNothing();

    // Create sample projects
    const sampleProjects = [
      {
        id: 'proj-web-app-1',
        organizationId: orgData.id,
        name: 'E-commerce Website Redesign',
        code: 'ECOM-2024',
        description: 'Complete redesign of the company e-commerce platform with modern UI/UX and improved performance',
        status: 'active',
        ownerId: userData.id,
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        metadata: {
          priority: 'high',
          budget: 50000,
          team: ['frontend', 'backend', 'design'],
          tags: ['ecommerce', 'redesign', 'ui/ux']
        },
        createdAt: new Date('2024-01-10T00:00:00.000Z'),
        updatedAt: new Date('2024-01-10T00:00:00.000Z'),
        deletedAt: null
      },
      {
        id: 'proj-mobile-app-2',
        organizationId: orgData.id,
        name: 'Mobile App Development',
        code: 'MOBILE-2024',
        description: 'Native mobile application for iOS and Android platforms',
        status: 'active',
        ownerId: userData.id,
        startDate: '2024-02-01',
        endDate: '2024-08-15',
        metadata: {
          priority: 'medium',
          budget: 75000,
          team: ['mobile', 'backend', 'qa'],
          tags: ['mobile', 'ios', 'android']
        },
        createdAt: new Date('2024-01-25T00:00:00.000Z'),
        updatedAt: new Date('2024-01-25T00:00:00.000Z'),
        deletedAt: null
      },
      {
        id: 'proj-api-integration-3',
        organizationId: orgData.id,
        name: 'Third-party API Integration',
        code: 'API-2024',
        description: 'Integration with payment processors and shipping providers',
        status: 'completed',
        ownerId: userData.id,
        startDate: '2023-11-01',
        endDate: '2023-12-15',
        metadata: {
          priority: 'high',
          budget: 25000,
          team: ['backend', 'integration'],
          tags: ['api', 'integration', 'payments']
        },
        createdAt: new Date('2023-10-20T00:00:00.000Z'),
        updatedAt: new Date('2023-12-15T00:00:00.000Z'),
        deletedAt: null
      },
      {
        id: 'proj-data-migration-4',
        organizationId: orgData.id,
        name: 'Legacy System Migration',
        code: 'MIGRATE-2024',
        description: 'Migration of legacy customer data to new CRM system',
        status: 'on-hold',
        ownerId: userData.id,
        startDate: '2024-03-01',
        endDate: '2024-07-01',
        metadata: {
          priority: 'medium',
          budget: 40000,
          team: ['backend', 'data', 'qa'],
          tags: ['migration', 'data', 'crm']
        },
        createdAt: new Date('2024-02-15T00:00:00.000Z'),
        updatedAt: new Date('2024-02-15T00:00:00.000Z'),
        deletedAt: null
      },
      {
        id: 'proj-security-audit-5',
        organizationId: orgData.id,
        name: 'Security Audit & Compliance',
        code: 'SEC-2024',
        description: 'Comprehensive security audit and GDPR compliance review',
        status: 'cancelled',
        ownerId: userData.id,
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        metadata: {
          priority: 'high',
          budget: 30000,
          team: ['security', 'compliance'],
          tags: ['security', 'audit', 'gdpr']
        },
        createdAt: new Date('2023-12-15T00:00:00.000Z'),
        updatedAt: new Date('2024-02-01T00:00:00.000Z'),
        deletedAt: null
      }
    ];

    await db.insert(projects).values(sampleProjects).onConflictDoNothing();

    console.log('✅ Basic database seeding completed successfully!');
    console.log('\n📋 Seeded data summary:');
    console.log(`   • 1 organization (Pivotal Flow Ltd)`);
    console.log(`   • 1 user (admin@pivotalflow.com)`);
    console.log(`   • 1 role (admin)`);
    console.log(`   • 1 user-role assignment`);
    console.log(`   • 5 sample projects`);

    console.log('\n🔑 Test credentials:');
    console.log('   • admin@pivotalflow.com');
    console.log('   • Password: password123!extra');

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