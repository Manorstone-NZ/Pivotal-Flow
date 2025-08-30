import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@pivotal-flow/shared/security/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'test-org' },
    update: {},
    create: {
      name: 'Test Organization',
      slug: 'test-org',
      domain: 'test.example.com',
      industry: 'Technology',
      size: 'small',
      timezone: 'UTC',
      currency: 'USD',
    },
  });

  console.log('✅ Organization created:', organization.name);

  // Create test roles
  const adminRole = await prisma.role.upsert({
    where: { 
      organizationId_name: {
        organizationId: organization.id,
        name: 'admin'
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'admin',
      description: 'Administrator role',
      permissions: ['*'],
      isSystem: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { 
      organizationId_name: {
        organizationId: organization.id,
        name: 'user'
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'user',
      description: 'Standard user role',
      permissions: ['read:own', 'write:own'],
      isSystem: true,
    },
  });

  console.log('✅ Roles created:', [adminRole.name, userRole.name]);

  // Create test users
  const adminPassword = await hashPassword('AdminPassword123!');
  const userPassword = await hashPassword('UserPassword123!');

  const adminUser = await prisma.user.upsert({
    where: { 
      organizationId_email: {
        organizationId: organization.id,
        email: 'admin@test.example.com'
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'admin@test.example.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      displayName: 'Admin User',
      status: 'active',
      emailVerified: true,
      passwordHash: adminPassword,
    },
  });

  const testUser = await prisma.user.upsert({
    where: { 
      organizationId_email: {
        organizationId: organization.id,
        email: 'user@test.example.com'
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'user@test.example.com',
      username: 'user',
      firstName: 'Test',
      lastName: 'User',
      displayName: 'Test User',
      status: 'active',
      emailVerified: true,
      passwordHash: userPassword,
    },
  });

  console.log('✅ Users created:', [adminUser.email, testUser.email]);

  // Assign roles to users
  await prisma.userRole.upsert({
    where: {
      userId_roleId_organizationId: {
        userId: adminUser.id,
        roleId: adminRole.id,
        organizationId: organization.id,
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
      organizationId: organization.id,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId_organizationId: {
        userId: testUser.id,
        roleId: userRole.id,
        organizationId: organization.id,
      }
    },
    update: {},
    create: {
      userId: testUser.id,
      roleId: userRole.id,
      organizationId: organization.id,
      isActive: true,
    },
  });

  console.log('✅ User roles assigned');

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin User:');
  console.log('  Email: admin@test.example.com');
  console.log('  Password: AdminPassword123!');
  console.log('User:');
  console.log('  Email: user@test.example.com');
  console.log('  Password: UserPassword123!');
  console.log('\n🔗 Organization: test-org');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

