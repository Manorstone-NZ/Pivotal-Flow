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
import { organizations, users, roles, userRoles, projects, permissions, rolePermissions } from '../src/lib/schema.js';

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
      city: 'Auckland',
      country: 'New Zealand',
      phone: '+64 9 123 4567',
      email: 'hello@pivotalflow.com',
      website: 'https://pivotalflow.com',
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

    // Create permissions for multi-tenant admin system
    console.log('🔐 Seeding permissions...');
    const permissionData = [
      // System-level permissions (Super Admin only)
      {
        id: 'perm-system-super-admin',
        name: 'Super Admin Access',
        description: 'Full system access across all tenants',
        category: 'system',
        resource: 'system',
        action: 'super_admin',
        createdAt: new Date(),
      },
      {
        id: 'perm-orgs-manage',
        name: 'Manage Organizations',
        description: 'Create, read, update, delete organizations',
        category: 'system',
        resource: 'organizations',
        action: 'manage',
        createdAt: new Date(),
      },
      // Tenant-level permissions (Tenant Admin)
      {
        id: 'perm-tenant-admin',
        name: 'Tenant Admin Access',
        description: 'Administrative access within a specific tenant',
        category: 'tenant',
        resource: 'tenant',
        action: 'admin',
        createdAt: new Date(),
      },
      {
        id: 'perm-users-manage',
        name: 'Manage Users',
        description: 'Create, read, update, delete users within tenant',
        category: 'tenant',
        resource: 'users',
        action: 'manage',
        createdAt: new Date(),
      },
      {
        id: 'perm-customers-manage',
        name: 'Manage Customers',
        description: 'Create, read, update, delete customers within tenant',
        category: 'tenant',
        resource: 'customers',
        action: 'manage',
        createdAt: new Date(),
      },
      {
        id: 'perm-projects-manage',
        name: 'Manage Projects',
        description: 'Create, read, update, delete projects within tenant',
        category: 'tenant',
        resource: 'projects',
        action: 'manage',
        createdAt: new Date(),
      },
      {
        id: 'perm-quotes-manage',
        name: 'Manage Quotes',
        description: 'Create, read, update, delete quotes within tenant',
        category: 'tenant',
        resource: 'quotes',
        action: 'manage',
        createdAt: new Date(),
      },
    ];

    await db.insert(permissions).values(permissionData).onConflictDoNothing();

    // Create Super Admin role (system-wide access)
    const superAdminRoleData = {
      id: 'role-super-admin',
      organizationId: orgData.id,
      name: 'super_admin',
      description: 'Super Administrator with cross-tenant access',
      isSystem: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(roles).values(superAdminRoleData).onConflictDoNothing();

    // Create Tenant Admin role (tenant-specific access)
    const tenantAdminRoleData = {
      id: 'role-tenant-admin',
      organizationId: orgData.id,
      name: 'tenant_admin',
      description: 'Tenant Administrator with organization-specific access',
      isSystem: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(roles).values(tenantAdminRoleData).onConflictDoNothing();

    // Assign permissions to Super Admin role
    const superAdminPermissions = [
      { id: 'rp-super-1', roleId: superAdminRoleData.id, permissionId: 'perm-system-super-admin', createdAt: new Date() },
      { id: 'rp-super-2', roleId: superAdminRoleData.id, permissionId: 'perm-orgs-manage', createdAt: new Date() },
      { id: 'rp-super-3', roleId: superAdminRoleData.id, permissionId: 'perm-tenant-admin', createdAt: new Date() },
      { id: 'rp-super-4', roleId: superAdminRoleData.id, permissionId: 'perm-users-manage', createdAt: new Date() },
      { id: 'rp-super-5', roleId: superAdminRoleData.id, permissionId: 'perm-customers-manage', createdAt: new Date() },
      { id: 'rp-super-6', roleId: superAdminRoleData.id, permissionId: 'perm-projects-manage', createdAt: new Date() },
      { id: 'rp-super-7', roleId: superAdminRoleData.id, permissionId: 'perm-quotes-manage', createdAt: new Date() },
    ];

    await db.insert(rolePermissions).values(superAdminPermissions).onConflictDoNothing();

    // Assign permissions to Tenant Admin role (no system-level permissions)
    const tenantAdminPermissions = [
      { id: 'rp-tenant-1', roleId: tenantAdminRoleData.id, permissionId: 'perm-tenant-admin', createdAt: new Date() },
      { id: 'rp-tenant-2', roleId: tenantAdminRoleData.id, permissionId: 'perm-users-manage', createdAt: new Date() },
      { id: 'rp-tenant-3', roleId: tenantAdminRoleData.id, permissionId: 'perm-customers-manage', createdAt: new Date() },
      { id: 'rp-tenant-4', roleId: tenantAdminRoleData.id, permissionId: 'perm-projects-manage', createdAt: new Date() },
      { id: 'rp-tenant-5', roleId: tenantAdminRoleData.id, permissionId: 'perm-quotes-manage', createdAt: new Date() },
    ];

    await db.insert(rolePermissions).values(tenantAdminPermissions).onConflictDoNothing();

    // Assign Super Admin role to the main user
    const userRoleData = {
      id: 'user-role-super-admin',
      userId: userData.id,
      roleId: superAdminRoleData.id,
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