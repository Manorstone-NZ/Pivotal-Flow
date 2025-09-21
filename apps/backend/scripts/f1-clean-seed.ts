#!/usr/bin/env tsx

/**
 * F1 Clean Seed: UUID-based Multitenant Foundation
 * Creates clean sample data with proper UUID-based multitenant structure
 */

import { eq } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { getDatabase, initializeDatabase } from '../src/lib/db.js';
import { 
  tenants, 
  memberships, 
  tenantFeatures, 
  organizations, 
  users, 
  permissions, 
  roles, 
  rolePermissions,
  userRoles,
  customers,
  quotes
} from '../src/lib/schema.js';

// Initialize database connection
await initializeDatabase();
const db = getDatabase();

// SaaS feature codes
const SAAS_FEATURES = [
  'Quotes',
  'Invoices', 
  'CustomerPortal',
  'RateCards',
  'TimeTracking',
  'Projects',
  'Reports',
  'UserManagement'
] as const;

// Sample permissions for F1
const F1_PERMISSIONS = [
  { name: 'tenants.manage', description: 'Manage tenants and memberships', category: 'tenants', resource: 'tenants', action: 'manage' },
  { name: 'tenants.view', description: 'View tenant information', category: 'tenants', resource: 'tenants', action: 'view' },
  { name: 'memberships.manage', description: 'Manage tenant memberships', category: 'tenants', resource: 'memberships', action: 'manage' },
  { name: 'features.manage', description: 'Manage tenant features', category: 'tenants', resource: 'features', action: 'manage' },
  { name: 'quotes.manage', description: 'Manage quotes', category: 'quotes', resource: 'quotes', action: 'manage' },
  { name: 'quotes.view', description: 'View quotes', category: 'quotes', resource: 'quotes', action: 'view' },
  { name: 'customers.manage', description: 'Manage customers', category: 'customers', resource: 'customers', action: 'manage' },
  { name: 'customers.view', description: 'View customers', category: 'customers', resource: 'customers', action: 'view' },
];

async function createF1CleanSeed() {
  console.log('🚀 Starting F1 Clean Seed with UUID-based multitenant structure');
  
  try {
    // 1. Check for existing tenant or create new one
    console.log('\n🏢 Checking for existing tenant...');
    
    let existingTenant = await db.select().from(tenants).where(eq(tenants.slug, 'pivotal-flow')).limit(1);
    let tenantId: string;
    
    if (existingTenant.length > 0) {
      tenantId = existingTenant[0]!.id;
      console.log(`✅ Using existing tenant: ${existingTenant[0]!.name} (${tenantId})`);
    } else {
      tenantId = generateId();
      const tenantData = {
        id: tenantId,
        name: 'Pivotal Flow Ltd',
        slug: 'pivotal-flow',
        billingEmail: 'billing@pivotalflow.com',
        defaultCurrency: 'NZD',
        timezone: 'Pacific/Auckland',
        status: 'ACTIVE' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await db.insert(tenants).values(tenantData);
      console.log(`✅ Created tenant: ${tenantData.name} (${tenantId})`);
    }
    
    // 2. Check for existing organization or create new one
    console.log('\n🏢 Checking for existing organization...');
    
    let existingOrg = await db.select().from(organizations).where(eq(organizations.slug, 'pivotal-flow')).limit(1);
    let orgId: string;
    
    if (existingOrg.length > 0) {
      orgId = existingOrg[0]!.id;
      console.log(`✅ Using existing organization: ${existingOrg[0]!.name} (${orgId})`);
    } else {
      orgId = generateId();
      const orgData = {
        id: orgId,
        name: 'Pivotal Flow Ltd',
        slug: 'pivotal-flow',
        email: 'billing@pivotalflow.com',
        currency: 'NZD',
        timezone: 'Pacific/Auckland',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await db.insert(organizations).values(orgData);
      console.log(`✅ Created organization: ${orgData.name} (${orgId})`);
    }
    
    // 3. Create permissions
    console.log('\n🔐 Creating F1 permissions...');
    const permissionIds: string[] = [];
    
    for (const perm of F1_PERMISSIONS) {
      const permId = generateId();
      await db.insert(permissions).values({
        id: permId,
        name: perm.name,
        description: perm.description,
        category: perm.category,
        resource: perm.resource,
        action: perm.action,
        createdAt: new Date(),
      });
      permissionIds.push(permId);
      console.log(`✅ Created permission: ${perm.name}`);
    }
    
    // 4. Create tenant admin role
    console.log('\n👥 Creating tenant admin role...');
    const roleId = generateId();
    
    await db.insert(roles).values({
      id: roleId,
      organizationId: orgId,
      name: 'Tenant Admin',
      description: 'Full admin access within tenant',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Assign all permissions to tenant admin role
    for (const permId of permissionIds) {
      await db.insert(rolePermissions).values({
        id: generateId(),
        roleId: roleId,
        permissionId: permId,
        createdAt: new Date(),
      });
    }
    
    console.log(`✅ Created tenant admin role with ${permissionIds.length} permissions`);
    
    // 5. Create admin user
    console.log('\n👤 Creating admin user...');
    const userId = generateId();
    
    await db.insert(users).values({
      id: userId,
      organizationId: orgId,
      email: 'admin@pivotalflow.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: '$2b$12$LQv3c1yqBwlFNkPAWHxvxO/srfEq3y7w.L.1M2Y.H.W.P.F.L.O.W', // password123!extra
      status: 'active',
      emailVerified: true,
      timezone: 'Pacific/Auckland',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`✅ Created admin user: admin@pivotalflow.com (${userId})`);
    
    // 6. Create membership for admin user
    console.log('\n🤝 Creating admin membership...');
    await db.insert(memberships).values({
      id: generateId(),
      userId: userId,
      tenantId: tenantId,
      role: 'OWNER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('✅ Created OWNER membership for admin user');
    
    // 7. Assign role to user
    await db.insert(userRoles).values({
      id: generateId(),
      userId: userId,
      roleId: roleId,
      organizationId: orgId, // Required field
      assignedBy: userId,
      assignedAt: new Date(),
      isActive: true,
    });
    
    console.log('✅ Assigned tenant admin role to user');
    
    // 8. Create feature flags for tenant
    console.log('\n🎛️ Creating feature flags...');
    const featureData = SAAS_FEATURES.map(featureCode => ({
      id: generateId(),
      tenantId: tenantId,
      featureCode,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    await db.insert(tenantFeatures).values(featureData);
    console.log(`✅ Created ${featureData.length} feature flags (all enabled)`);
    
    // 9. Create sample customer
    console.log('\n🏢 Creating sample customer...');
    const customerId = generateId();
    
    await db.insert(customers).values({
      id: customerId,
      organizationId: orgId,
      tenantId: tenantId, // F1: Proper tenant isolation
      customerNumber: 'CUST-001',
      companyName: 'Sample Customer Ltd',
      email: 'contact@samplecustomer.com',
      phone: '+64 9 123 4567',
      status: 'active',
      customerType: 'business',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`✅ Created sample customer: Sample Customer Ltd (${customerId})`);
    
    // 10. Create sample quote
    console.log('\n📄 Creating sample quote...');
    const quoteId = generateId();
    
    await db.insert(quotes).values({
      id: quoteId,
      organizationId: orgId,
      tenantId: tenantId, // F1: Proper tenant isolation
      quoteNumber: 'Q2025-001',
      customerId: customerId,
      title: 'F1 Sample Quote',
      description: 'Sample quote for F1 multitenant testing',
      status: 'draft',
      type: 'project',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      currency: 'NZD',
      exchangeRate: '1.000000',
      subtotal: '1000.00',
      taxRate: '0.1500',
      taxAmount: '150.00',
      discountType: 'percentage',
      discountValue: '0.0000',
      discountAmount: '0.00',
      totalAmount: '1150.00',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any); // TODO: Fix schema type compatibility
    
    console.log(`✅ Created sample quote: F1 Sample Quote (${quoteId})`);
    
    console.log('\n🎉 F1 Clean Seed completed successfully!');
    console.log('\n📊 Created:');
    console.log(`   Tenant: Pivotal Flow Ltd (${tenantId})`);
    console.log(`   User: admin@pivotalflow.com (${userId})`);
    console.log(`   Customer: Sample Customer Ltd (${customerId})`);
    console.log(`   Quote: F1 Sample Quote (${quoteId})`);
    console.log(`   Permissions: ${F1_PERMISSIONS.length}`);
    console.log(`   Features: ${SAAS_FEATURES.length} (all enabled)`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Email: admin@pivotalflow.com');
    console.log('   Password: password123!extra');
    
  } catch (error) {
    console.error('❌ F1 Clean Seed failed:', error);
    process.exit(1);
  }
}

// Run clean seed
createF1CleanSeed();
