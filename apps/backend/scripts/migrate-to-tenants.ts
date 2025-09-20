#!/usr/bin/env tsx

/**
 * F1 Data Migration: Organizations to Tenants
 * Migrates existing organizations to the new tenant structure
 */

import { eq } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { getDatabase, initializeDatabase } from '../src/lib/db.js';
import { organizations, tenants, memberships, tenantFeatures, users } from '../src/lib/schema.js';

// Initialize database connection
await initializeDatabase();
const db = getDatabase();

// SaaS feature codes for tenant allow-listing
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

async function migrateOrganizationsToTenants() {
  console.log('🚀 Starting F1 migration: Organizations → Tenants');
  
  try {
    // 1. Get all existing organizations
    const existingOrgs = await db.select().from(organizations);
    console.log(`📊 Found ${existingOrgs.length} organizations to migrate`);
    
    for (const org of existingOrgs) {
      console.log(`\n🏢 Migrating organization: ${org.name} (${org.id})`);
      
      // 2. Create corresponding tenant with new UUID
      const tenantId = generateId();
      const tenantData = {
        id: tenantId, // Generate new UUID for tenant
        name: org.name,
        slug: org.slug,
        billingEmail: org.email || `billing@${org.slug}.com`,
        defaultCurrency: org.currency || 'USD',
        timezone: org.timezone || 'UTC',
        status: 'ACTIVE' as const,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt || new Date(),
      };
      
      await db.insert(tenants).values(tenantData);
      console.log(`✅ Created tenant: ${tenantData.name}`);
      
      // 3. Get all users in this organization
      const orgUsers = await db
        .select()
        .from(users)
        .where(eq(users.organizationId, org.id));
      
      console.log(`👥 Found ${orgUsers.length} users in organization`);
      
      // 4. Create memberships for all users
      for (const user of orgUsers) {
        // Determine role based on existing permissions/roles
        let membershipRole = 'STAFF'; // Default role
        
        // Check if user has admin permissions (simplified logic)
        if (user.email === 'admin@pivotalflow.com') {
          membershipRole = 'OWNER';
        } else if (user.email?.includes('admin')) {
          membershipRole = 'ADMIN';
        }
        
        const membershipData = {
          id: generateId(),
          userId: user.id,
          tenantId: tenantId,
          role: membershipRole as 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await db.insert(memberships).values(membershipData);
        console.log(`✅ Created membership: ${user.email} → ${membershipRole}`);
      }
      
      // 5. Create default feature flags for tenant
      const featureData = SAAS_FEATURES.map(featureCode => ({
        id: `feature-${org.id}-${featureCode.toLowerCase()}`,
        tenantId: org.id,
        featureCode,
        enabled: true, // Enable all features by default
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      await db.insert(tenantFeatures).values(featureData);
      console.log(`✅ Created ${featureData.length} feature flags`);
    }
    
    // 6. Backfill tenant_id on domain tables
    console.log('\n🔄 Backfilling tenant_id on domain tables...');
    
    // Update customers
    await db.execute(`
      UPDATE customers 
      SET tenant_id = organization_id 
      WHERE tenant_id IS NULL
    `);
    console.log('✅ Backfilled customers.tenant_id');
    
    // Update quotes
    await db.execute(`
      UPDATE quotes 
      SET tenant_id = organization_id 
      WHERE tenant_id IS NULL
    `);
    console.log('✅ Backfilled quotes.tenant_id');
    
    // Update projects
    await db.execute(`
      UPDATE projects 
      SET tenant_id = organization_id 
      WHERE tenant_id IS NULL
    `);
    console.log('✅ Backfilled projects.tenant_id');
    
    // Update time_entries
    await db.execute(`
      UPDATE time_entries 
      SET tenant_id = organization_id 
      WHERE tenant_id IS NULL
    `);
    console.log('✅ Backfilled time_entries.tenant_id');
    
    // Update invoices
    await db.execute(`
      UPDATE invoices 
      SET tenant_id = organization_id 
      WHERE tenant_id IS NULL
    `);
    console.log('✅ Backfilled invoices.tenant_id');
    
    // Update rate_cards
    await db.execute(`
      UPDATE rate_cards 
      SET tenant_id = organization_id 
      WHERE tenant_id IS NULL
    `);
    console.log('✅ Backfilled rate_cards.tenant_id');
    
    console.log('\n🎉 F1 migration completed successfully!');
    console.log('📊 Migration Summary:');
    
    const tenantCount = await db.select().from(tenants);
    const membershipCount = await db.select().from(memberships);
    const featureCount = await db.select().from(tenantFeatures);
    
    console.log(`   Tenants created: ${tenantCount.length}`);
    console.log(`   Memberships created: ${membershipCount.length}`);
    console.log(`   Feature flags created: ${featureCount.length}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateOrganizationsToTenants();
