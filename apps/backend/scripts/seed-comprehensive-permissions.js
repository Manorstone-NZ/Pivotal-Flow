#!/usr/bin/env tsx
/**
 * Comprehensive Permission Seeding
 * Creates all permissions needed by the access control system
 */
import { generateId } from '@pivotal-flow/shared';
import { getDatabase, initializeDatabase } from '../src/lib/db.js';
import { permissions, roles, rolePermissions, userRoles, users, organizations } from '../src/lib/schema.js';
import { eq, and } from 'drizzle-orm';
// argon2 import removed as it's not used in this script
// Initialize database connection
await initializeDatabase();
const db = getDatabase();
// Comprehensive permission definitions based on access-control.ts
const COMPREHENSIVE_PERMISSIONS = [
    // User management
    { name: 'users.view_users', description: 'View users', category: 'users', resource: 'users', action: 'view_users' },
    { name: 'users.create_users', description: 'Create users', category: 'users', resource: 'users', action: 'create_users' },
    { name: 'users.update_users', description: 'Update users', category: 'users', resource: 'users', action: 'update_users' },
    { name: 'users.delete_users', description: 'Delete users', category: 'users', resource: 'users', action: 'delete_users' },
    // Quote management  
    { name: 'quotes.view_quotes', description: 'View quotes', category: 'quotes', resource: 'quotes', action: 'view_quotes' },
    { name: 'quotes.create_quotes', description: 'Create quotes', category: 'quotes', resource: 'quotes', action: 'create_quotes' },
    { name: 'quotes.update_quotes', description: 'Update quotes', category: 'quotes', resource: 'quotes', action: 'update_quotes' },
    { name: 'quotes.delete_quotes', description: 'Delete quotes', category: 'quotes', resource: 'quotes', action: 'delete_quotes' },
    // Project management
    { name: 'projects.view_projects', description: 'View projects', category: 'projects', resource: 'projects', action: 'view_projects' },
    { name: 'projects.create_projects', description: 'Create projects', category: 'projects', resource: 'projects', action: 'create_projects' },
    { name: 'projects.update_projects', description: 'Update projects', category: 'projects', resource: 'projects', action: 'update_projects' },
    { name: 'projects.delete_projects', description: 'Delete projects', category: 'projects', resource: 'projects', action: 'delete_projects' },
    // Time tracking
    { name: 'time.view_time_entries', description: 'View time entries', category: 'time', resource: 'time_entries', action: 'view_time_entries' },
    { name: 'time.create_time_entries', description: 'Create time entries', category: 'time', resource: 'time_entries', action: 'create_time_entries' },
    { name: 'time.update_time_entries', description: 'Update time entries', category: 'time', resource: 'time_entries', action: 'update_time_entries' },
    { name: 'time.delete_time_entries', description: 'Delete time entries', category: 'time', resource: 'time_entries', action: 'delete_time_entries' },
    // Payments
    { name: 'payments.view_payments', description: 'View payments', category: 'payments', resource: 'payments', action: 'view_payments' },
    { name: 'payments.create_payments', description: 'Create payments', category: 'payments', resource: 'payments', action: 'create_payments' },
    { name: 'payments.update_payments', description: 'Update payments', category: 'payments', resource: 'payments', action: 'update_payments' },
    { name: 'payments.delete_payments', description: 'Delete payments', category: 'payments', resource: 'payments', action: 'delete_payments' },
    // Reports
    { name: 'reports.view_reports', description: 'View reports', category: 'reports', resource: 'reports', action: 'view_reports' },
    { name: 'reports.export_reports', description: 'Export reports', category: 'reports', resource: 'reports', action: 'export_reports' },
    // Portal (customer-facing)
    { name: 'portal.view_quotes', description: 'View portal quotes', category: 'portal', resource: 'portal', action: 'view_quotes' },
    { name: 'portal.view_invoices', description: 'View portal invoices', category: 'portal', resource: 'portal', action: 'view_invoices' },
    { name: 'portal.view_time', description: 'View portal time', category: 'portal', resource: 'portal', action: 'view_time' },
    // Permissions management
    { name: 'permissions.view_permissions', description: 'View permissions', category: 'permissions', resource: 'permissions', action: 'view_permissions' },
    { name: 'permissions.create_permissions', description: 'Create permissions', category: 'permissions', resource: 'permissions', action: 'create_permissions' },
    { name: 'permissions.update_permissions', description: 'Update permissions', category: 'permissions', resource: 'permissions', action: 'update_permissions' },
    { name: 'permissions.delete_permissions', description: 'Delete permissions', category: 'permissions', resource: 'permissions', action: 'delete_permissions' },
    // Roles management
    { name: 'roles.view_roles', description: 'View roles', category: 'roles', resource: 'roles', action: 'view_roles' },
    { name: 'roles.create_roles', description: 'Create roles', category: 'roles', resource: 'roles', action: 'create_roles' },
    { name: 'roles.update_roles', description: 'Update roles', category: 'roles', resource: 'roles', action: 'update_roles' },
    { name: 'roles.delete_roles', description: 'Delete roles', category: 'roles', resource: 'roles', action: 'delete_roles' },
    // Currencies
    { name: 'currencies.view_currencies', description: 'View currencies', category: 'currencies', resource: 'currencies', action: 'view_currencies' },
    { name: 'currencies.create_currencies', description: 'Create currencies', category: 'currencies', resource: 'currencies', action: 'create_currencies' },
    { name: 'currencies.update_currencies', description: 'Update currencies', category: 'currencies', resource: 'currencies', action: 'update_currencies' },
    { name: 'currencies.delete_currencies', description: 'Delete currencies', category: 'currencies', resource: 'currencies', action: 'delete_currencies' },
    // Rate cards
    { name: 'rate_cards.view_rate_cards', description: 'View rate cards', category: 'rate_cards', resource: 'rate_cards', action: 'view_rate_cards' },
    { name: 'rate_cards.create_rate_cards', description: 'Create rate cards', category: 'rate_cards', resource: 'rate_cards', action: 'create_rate_cards' },
    { name: 'rate_cards.update_rate_cards', description: 'Update rate cards', category: 'rate_cards', resource: 'rate_cards', action: 'update_rate_cards' },
    { name: 'rate_cards.delete_rate_cards', description: 'Delete rate cards', category: 'rate_cards', resource: 'rate_cards', action: 'delete_rate_cards' },
    // Customer management (using exact strings from access-control.ts)
    { name: 'Manage Customers', description: 'Manage customers and contacts', category: 'customers', resource: 'customers', action: 'manage' },
    // Invoices
    { name: 'invoices.view_invoices', description: 'View invoices', category: 'invoices', resource: 'invoices', action: 'view_invoices' },
    { name: 'invoices.create_invoices', description: 'Create invoices', category: 'invoices', resource: 'invoices', action: 'create_invoices' },
    { name: 'invoices.update_invoices', description: 'Update invoices', category: 'invoices', resource: 'invoices', action: 'update_invoices' },
    { name: 'invoices.delete_invoices', description: 'Delete invoices', category: 'invoices', resource: 'invoices', action: 'delete_invoices' },
    // Organizations (legacy - being replaced by F1 tenants)
    { name: 'Super Admin Access', description: 'Legacy super admin access', category: 'system', resource: 'system', action: 'super_admin' },
    { name: 'Manage Organizations', description: 'Manage organizations', category: 'organizations', resource: 'organizations', action: 'manage' },
    { name: 'Manage Users', description: 'Manage users', category: 'users', resource: 'users', action: 'manage' },
    // F1 Tenant Administration (already exists)
    { name: 'tenants.view', description: 'View tenants', category: 'tenants', resource: 'tenants', action: 'view' },
    { name: 'tenants.manage', description: 'Manage tenants', category: 'tenants', resource: 'tenants', action: 'manage' },
    { name: 'tenants.switch', description: 'Switch between tenants', category: 'tenants', resource: 'tenants', action: 'switch' },
    { name: 'memberships.manage', description: 'Manage tenant memberships', category: 'tenants', resource: 'memberships', action: 'manage' },
    { name: 'features.manage', description: 'Manage tenant features', category: 'tenants', resource: 'features', action: 'manage' },
    // Additional commonly needed permissions
    { name: 'approvals.view_approvals', description: 'View approvals', category: 'approvals', resource: 'approvals', action: 'view_approvals' },
    { name: 'approvals.create_approvals', description: 'Create approvals', category: 'approvals', resource: 'approvals', action: 'create_approvals' },
    { name: 'approvals.decide_approvals', description: 'Decide on approvals', category: 'approvals', resource: 'approvals', action: 'decide_approvals' },
];
async function seedComprehensivePermissions() {
    console.log('🚀 Starting comprehensive permission seeding');
    try {
        // 1. Create all permissions (with conflict handling)
        console.log('\n🔐 Creating comprehensive permissions...');
        const permissionIds = {};
        for (const perm of COMPREHENSIVE_PERMISSIONS) {
            const permId = generateId();
            try {
                await db.insert(permissions).values({
                    id: permId,
                    name: perm.name,
                    description: perm.description,
                    category: perm.category,
                    resource: perm.resource,
                    action: perm.action,
                    createdAt: new Date(),
                });
                permissionIds[perm.name] = permId;
                console.log(`✅ Created permission: ${perm.name}`);
            }
            catch (error) {
                if (error.message?.includes('duplicate key')) {
                    // Permission already exists, get its ID
                    const [existing] = await db.select().from(permissions).where(eq(permissions.name, perm.name)).limit(1);
                    if (existing) {
                        permissionIds[perm.name] = existing.id;
                        console.log(`ℹ️  Permission already exists: ${perm.name}`);
                    }
                }
                else {
                    console.error(`❌ Failed to create permission ${perm.name}:`, error.message);
                }
            }
        }
        // 2. Create or update Platform Admin role
        console.log('\n👑 Creating Platform Admin role...');
        let adminRoleId = generateId();
        // Get the first organization for role assignment
        const [firstOrg] = await db.select().from(organizations).limit(1);
        if (!firstOrg) {
            throw new Error('No organization found for role assignment');
        }
        try {
            await db.insert(roles).values({
                id: adminRoleId,
                organizationId: firstOrg.id,
                name: 'Platform Admin',
                description: 'Full platform access with all permissions',
                isSystem: true,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log(`✅ Created Platform Admin role: ${adminRoleId}`);
        }
        catch (error) {
            if (error.message?.includes('duplicate key')) {
                console.log('ℹ️  Platform Admin role already exists');
                // Get existing role
                const [existingRole] = await db.select().from(roles)
                    .where(and(eq(roles.name, 'Platform Admin'), eq(roles.organizationId, firstOrg.id)))
                    .limit(1);
                if (existingRole) {
                    adminRoleId = existingRole.id;
                }
            }
            else {
                throw error;
            }
        }
        // 3. Assign ALL permissions to Platform Admin role
        console.log('\n🔗 Assigning permissions to Platform Admin...');
        let assignedCount = 0;
        for (const [permissionName, permissionId] of Object.entries(permissionIds)) {
            try {
                await db.insert(rolePermissions).values({
                    id: generateId(),
                    roleId: adminRoleId,
                    permissionId: permissionId,
                    createdAt: new Date(),
                });
                assignedCount++;
            }
            catch (error) {
                if (!error.message?.includes('duplicate key')) {
                    console.error(`❌ Failed to assign permission ${permissionName}:`, error.message);
                }
            }
        }
        console.log(`✅ Assigned ${assignedCount} permissions to Platform Admin role`);
        // 4. Assign Platform Admin role to admin user
        console.log('\n👤 Assigning Platform Admin role to admin user...');
        const [adminUser] = await db.select().from(users)
            .where(eq(users.email, 'admin@pivotalflow.com'))
            .limit(1);
        if (!adminUser) {
            throw new Error('Admin user not found');
        }
        try {
            await db.insert(userRoles).values({
                id: generateId(),
                userId: adminUser.id,
                roleId: adminRoleId,
                organizationId: adminUser.organizationId,
                assignedBy: adminUser.id,
                assignedAt: new Date(),
                isActive: true,
            });
            console.log(`✅ Assigned Platform Admin role to ${adminUser.email}`);
        }
        catch (error) {
            if (error.message?.includes('duplicate key')) {
                console.log(`ℹ️  Platform Admin role already assigned to ${adminUser.email}`);
            }
            else {
                throw error;
            }
        }
        // 5. Create Limited User for testing
        console.log('\n👥 Creating limited user for permission testing...');
        const limitedUserId = generateId();
        const limitedUserEmail = 'limited@pivotalflow.com';
        try {
            await db.insert(users).values({
                id: limitedUserId,
                organizationId: firstOrg.id,
                email: limitedUserEmail,
                firstName: 'Limited',
                lastName: 'User',
                passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$tM86VsQBnh43jeogJJkxUw$j3zqx0OrMdfe1bKGrzwwJ/5vB02x3DvqBamGdCobVv8', // password123!extra
                status: 'active',
                emailVerified: true,
                timezone: 'Pacific/Auckland',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log(`✅ Created limited user: ${limitedUserEmail}`);
        }
        catch (error) {
            if (error.message?.includes('duplicate key')) {
                console.log(`ℹ️  Limited user already exists: ${limitedUserEmail}`);
            }
            else {
                throw error;
            }
        }
        // 6. Create Limited Role with only basic permissions
        console.log('\n🔒 Creating Limited Role...');
        const limitedRoleId = generateId();
        const limitedPermissions = [
            'quotes.view_quotes',
            'customers.view', // Use the F1 permission name
            'projects.view_projects',
        ];
        try {
            await db.insert(roles).values({
                id: limitedRoleId,
                organizationId: firstOrg.id,
                name: 'Limited User',
                description: 'Limited access for testing permission restrictions',
                isSystem: false,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Assign limited permissions
            for (const permName of limitedPermissions) {
                const permId = permissionIds[permName];
                if (permId) {
                    try {
                        await db.insert(rolePermissions).values({
                            id: generateId(),
                            roleId: limitedRoleId,
                            permissionId: permId,
                            createdAt: new Date(),
                        });
                    }
                    catch (error) {
                        if (!error.message?.includes('duplicate key')) {
                            console.error(`Failed to assign ${permName}:`, error.message);
                        }
                    }
                }
            }
            console.log(`✅ Created Limited Role with ${limitedPermissions.length} permissions`);
        }
        catch (error) {
            if (error.message?.includes('duplicate key')) {
                console.log('ℹ️  Limited Role already exists');
            }
            else {
                throw error;
            }
        }
        console.log('\n🎉 Comprehensive permission seeding completed!');
        console.log('\n📊 Summary:');
        console.log(`   Total permissions: ${COMPREHENSIVE_PERMISSIONS.length}`);
        console.log(`   Platform Admin: All permissions granted`);
        console.log(`   Limited User: ${limitedPermissions.length} permissions granted`);
        console.log('\n🔑 Test Credentials:');
        console.log('   Platform Admin: admin@pivotalflow.com / password123!extra');
        console.log('   Limited User: limited@pivotalflow.com / password123!extra');
    }
    catch (error) {
        console.error('❌ Comprehensive permission seeding failed:', error);
        process.exit(1);
    }
}
// Run comprehensive permission seeding
seedComprehensivePermissions();
//# sourceMappingURL=seed-comprehensive-permissions.js.map